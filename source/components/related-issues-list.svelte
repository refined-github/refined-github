<script lang="ts">
	import {excludePreset} from '../features/rgh-dim-commits.js';
	import api from '../github-helpers/api.js';
	import {parseBackticks} from '../github-helpers/dom-formatters.js';
	import {getExtensionReleaseDate} from '../helpers/extension-release-age.js';
	import {getFeatureRelatedIssuesQuery} from '../helpers/rgh-links.js';
	import IssuePrIcon from './issue-pr-icon.svelte';
	import GetRelatedIssuesList from './related-issues-list.gql';

	type RelatedIssue = {
		__typename: 'Issue' | 'PullRequest';
		number: number;
		title: string;
		url: string;
		state: 'OPEN' | 'CLOSED' | 'MERGED';
		stateReason?: 'COMPLETED' | 'NOT_PLANNED' | 'REOPENED' | 'DUPLICATE';
		isDraft?: boolean;
		mergedAt?: string;
		isReleased?: boolean;
	};

	const {featureId}: {featureId: string} = $props();

	// Open issues, plus the closed issues and merged PRs created since the user's version was released
	const listPromise = $derived.by(async (): Promise<RelatedIssue[]> => {
		const since = getExtensionReleaseDate().toISOString().slice(0, 10);
		const terms = getFeatureRelatedIssuesQuery(featureId).replace(
			'state:open ',
			'',
		);
		// GitHub's search requires `is:issue` or `is:pr` and returns nothing otherwise. `-is:unmerged` drops open and closed PRs
		const query =
			`repo:refined-github/refined-github (is:issue OR is:pr) -is:unmerged ${terms} (state:open OR created:>=${since}) sort:created-desc`;

		const {search, repository} = await api.v4(GetRelatedIssuesList, {
			variables: {query},
		});
		const latestRelease = repository.latestRelease?.publishedAt;
		return search.nodes
			.filter((issue: RelatedIssue) => !excludePreset.test(issue.title))
			.map((issue: RelatedIssue) => ({
				...issue,
				isReleased: Boolean(
					latestRelease && issue.mergedAt && issue.mergedAt <= latestRelease,
				),
			}));
	});
</script>

{#await listPromise then list}
	{#if list.length > 0}
		<div class="Box Box--condensed mb-3 tmp-mb-3 d-inline-block width-full">
			<div class="Box-header">
				<h3 class="Box-title">Recent issues</h3>
			</div>
			{#each list as issue (issue.url)}
				<div class="Box-row d-flex flex-items-baseline gap-2">
					<IssuePrIcon
						type={issue.__typename}
						state={issue.state}
						stateReason={issue.stateReason}
						isDraft={issue.isDraft}
					/>
					<!-- Open in a new tab to avoid form content loss -->
					<a
						href={issue.url}
						target="_blank"
						rel="noopener noreferrer"
						class="Link--primary wb-break-word"
						use:parseBackticks
					>
						{issue.title}
					</a>
					{#if issue.mergedAt && !issue.isReleased}
						<span class="color-fg-muted text-small flex-shrink-0"
						>Not yet released</span>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
{/await}
