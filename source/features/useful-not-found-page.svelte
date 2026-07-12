<script lang="ts">
	import api from '../github-helpers/api.js';
	import getDefaultBranch from '../github-helpers/get-default-branch.js';
	import GitHubFileUrl from '../github-helpers/github-file-url.js';
	import {isUrlReachable} from '../github-helpers/index.js';
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

	type GitHistory = {
		oldFilename: string;
		lastVersionUrl: string;
		status: string;
		movedUrl: string;
		commitUrl: string;
		commitDate: Date;
	};

	function getType(): string {
		return location.pathname.split('/').pop()!.includes('.') ? 'file' : 'object';
	}

	async function getLatestCommitToFile(
		branch: string,
		filePath: string,
	): Promise<string> {
		const {repository} = await api.v4(GetLatestCommitToFile, {
			variables: {branch, filePath},
		});

		return repository.object
			// Missing if the ref doesn't exist
			?.history.nodes[0]
			// Missing if the ref exists but the file never existed
			?.oid;
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
		if (!commitSha) {
			// Never existed
			return undefined;
		}

		const fileChanges = await getChangesToFileInCommit(commitSha, url.filePath);
		if (!fileChanges) {
			return undefined;
		}

		return {
			oldFilename: fileChanges.file.previous_filename ?? fileChanges.file.filename,
			lastVersionUrl: fileChanges.file.status === 'removed'
				? fileChanges.file.blob_url
				: url.href,
			status: fileChanges.file.status,
			movedUrl: decodeURIComponent(fileChanges.file.blob_url), // Why is the API returning dir%2Ffile.js??!
			commitUrl: fileChanges.commit.url,
			commitDate: fileChanges.commit.date,
		};
	}

	const type = getType();
</script>

<div class="color-fg-muted rgh-hide-if-empty">
	{#await getGitHistory()}
		Loading history of this {type}...
	{:then gitHistory}
		{#if gitHistory}
			<span class="commit-ref">
				<a href={gitHistory.commitUrl}>
					{new GitHubFileUrl(gitHistory.commitUrl).branch.slice(0, 8)}
				</a>
			</span>
			{gitHistory.status}
			<a href={gitHistory.lastVersionUrl}>{gitHistory.oldFilename}</a>
			{#if gitHistory.status !== 'removed'}
				to <a href={gitHistory.movedUrl}>{
					gitHistory.movedUrl.split('/').slice(7).join('/')
				}</a>
			{/if}
			<relative-time datetime={gitHistory.commitDate}></relative-time>.
		{:else}
			<!-- TODO: Handle scenario. Can be because branch OR file is 404 -->
		{/if}
	{/await}
</div>

<div class="color-fg-muted rgh-hide-if-empty">
	{#await getUrlToFileOnDefaultBranch()}
		Loading default branch...
	{:then defaultBranchUrl}
		{#if defaultBranchUrl}
			<a href={defaultBranchUrl}>{
				new GitHubFileUrl(defaultBranchUrl).filePath
			}</a> exists on the default branch.
		{/if}
	{/await}
</div>
