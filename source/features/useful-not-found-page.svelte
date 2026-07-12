<script lang="ts">
	import * as pageDetect from 'github-url-detection';

	import api from '../github-helpers/api.js';
	import getDefaultBranch from '../github-helpers/get-default-branch.js';
	import GitHubFileUrl from '../github-helpers/github-file-url.js';
	import {getCleanPathname, isUrlReachable} from '../github-helpers/index.js';
	import GetLatestCommitToFile from './useful-not-found-page.gql';

	type File = {
		previous_filename?: string;
		filename: string;
		status: string;
		blob_url: string;
	};

	type FileChanges = {
		file: File;
		commit: {
			parentSha: string;
			date: Date;
			url: string;
		};
	};

	type Crumb = {
		text: string;
		href?: string;
		strike: boolean;
	};

	type GitHistory = {
		lastVersionUrl: string;
		status: string;
		movedUrl: string;
		commitUrl: string;
		commitDate: Date;
		commitHistoryUrl: string;
	};

	function getType(): string {
		return location.pathname.split('/').pop()!.includes('.') ? 'file' : 'object';
	}

	function parseCurrentUrl(): string[] {
		const parts = getCleanPathname().split('/');
		if (parts[2] === 'blob') {
			parts[2] = 'tree';
		}

		return parts;
	}

	function buildCrumbs(): Crumb[] {
		const parts = parseCurrentUrl();

		// Remove the first 3 parts because they're most likely already on the page (user, repo, tree/blob/edit)
		const offset = 4;

		return parts.slice(offset).map((part, index) => {
			const strike = index === parts.length - offset - 1;
			return {
				text: part,
				href: strike
					? undefined
					: '/' + parts.slice(0, offset + index + 1).join('/'),
				strike,
			};
		});
	}

	async function getLatestCommitToFile(
		branch: string,
		filePath: string,
	): Promise<string> {
		const {repository} = await api.v4(GetLatestCommitToFile, {
			variables: {branch, filePath},
		});
		return repository.object.history.nodes[0].oid;
	}

	async function getChangesToFileInCommit(
		sha: string,
		filePath: string,
	): Promise<FileChanges | undefined> {
		const commit = await api.v3(`commits/${sha}`);
		for (const fileInfo of commit.files as File[]) {
			if ([fileInfo.filename, fileInfo.previous_filename].includes(filePath)) {
				return {
					commit: {
						parentSha: commit.parents[0].sha,
						date: commit.commit.committer.date,
						url: commit.html_url,
					},
					file: fileInfo,
				};
			}
		}

		return undefined;
	}

	async function getUrlToFileOnDefaultBranch(): Promise<string | undefined> {
		const parsedUrl = new GitHubFileUrl(location.href);
		if (!parsedUrl.branch) {
			return undefined;
		}

		parsedUrl.assign({branch: await getDefaultBranch()});
		const urlOnDefault = parsedUrl.href;
		if (urlOnDefault !== location.href && await isUrlReachable(urlOnDefault)) {
			return urlOnDefault;
		}

		return undefined;
	}

	async function getGitHistory(): Promise<GitHistory | undefined> {
		const url = new GitHubFileUrl(location.href);
		if (!url.branch || !url.filePath) {
			return undefined;
		}

		const commitSha = await getLatestCommitToFile(url.branch, url.filePath);
		const fileChanges = await getChangesToFileInCommit(commitSha, url.filePath);
		if (!fileChanges) {
			return undefined;
		}

		url.assign({route: 'commits'});
		const commitHistoryUrl = url.href;
		url.assign({
			route: 'blob',
			branch: fileChanges.commit.parentSha,
			filePath: url.filePath,
		});

		return {
			lastVersionUrl: fileChanges.file.status === 'removed'
				? fileChanges.file.blob_url
				: url.href,
			status: fileChanges.file.status,
			movedUrl: fileChanges.file.blob_url,
			commitUrl: fileChanges.commit.url,
			commitDate: fileChanges.commit.date,
			commitHistoryUrl,
		};
	}

	type Props = {
		branch?: string;
	};

	const {branch}: Props = $props();

	console.log('useful-not-found-page: branch inside', branch);
	const type = getType();
	const showBreadcrumbs = $derived(
		// No branch = no folder exists either
		branch
			// /tree/ URLs have breadcrumbs, but /blob/ URLs don't
			&& pageDetect.isSingleFile(),
	);
	const showFileInfo = pageDetect.isSingleFile() || pageDetect.isRepoTree()
		|| pageDetect.isEditingFile();
	const muted = pageDetect.isRepoFile404();

	const crumbs: Crumb[] = $state(showBreadcrumbs ? buildCrumbs() : []);
	let defaultBranchUrl: string | undefined = $state();
	let gitHistory: GitHistory | undefined = $state();

	$effect(() => {
		for (const crumb of crumbs) {
			(async () => {
				crumb.strike = !(crumb.href && await isUrlReachable(crumb.href));
			})();
		}
	});

	$effect(() => {
		if (showFileInfo && !pageDetect.isRepoRoot()) {
			(async () => {
				defaultBranchUrl = await getUrlToFileOnDefaultBranch();
			})();
		}

		if (showFileInfo || muted) {
			(async () => {
				gitHistory = await getGitHistory();
			})();
		}
	});
</script>

{#if gitHistory}
	<p class={muted ? 'color-fg-muted' : 'container mt-4 tmp-mt-3 text-center'}>
		<a href={gitHistory.lastVersionUrl}>This {type}</a> was
		{#if gitHistory.status === 'removed'}
			deleted
		{:else}
			<a href={gitHistory.movedUrl}>moved</a>
		{/if}
		(<a href={gitHistory.commitUrl} title="View commit">
			<relative-time datetime={gitHistory.commitDate}></relative-time>
		</a>) - <a href={gitHistory.commitHistoryUrl}>Commit history</a>.
	</p>
{/if}

{#if showBreadcrumbs}
	<h4 class="container mt-4 tmp-mt-3 text-center">
		{#each crumbs as crumb, index (index)}
			{index > 0 ? ' / ' : ''}
			{#if crumb.strike}
				<del class="color-fg-subtle">{crumb.text}</del>
			{:else}
				<a href={crumb.href}>{crumb.text}</a>
			{/if}
		{/each}
	</h4>
{/if}

{#if showFileInfo && defaultBranchUrl}
	<p class="container mt-4 tmp-mt-3 text-center">
		View <a href={defaultBranchUrl}>{type}</a> on the default branch.
	</p>
{/if}
