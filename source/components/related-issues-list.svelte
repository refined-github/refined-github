<script lang="ts">
	import api from '../github-helpers/api.js';
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
	};

	const {featureId}: {featureId: string} = $props();

	function toSearchDate(date: Date): string {
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${date.getFullYear()}-${month}-${day}`;
	}

	// Open issues and PRs, plus the closed ones created since the user's version was released
	const listPromise = $derived.by(async (): Promise<RelatedIssue[]> => {
		const since = toSearchDate(getExtensionReleaseDate());
		const terms = getFeatureRelatedIssuesQuery(featureId).replace(
			'state:open ',
			'',
		);
		// GitHub's search requires `is:issue` or `is:pr` and returns nothing otherwise
		const query =
			`repo:refined-github/refined-github (is:issue OR is:pr) ${terms} (state:open OR created:>=${since}) sort:created-desc`;

		const {search} = await api.v4(GetRelatedIssuesList, {variables: {query}});
		return search.nodes;
	});
</script>

{#await listPromise then list}
	{#if list.length > 0}
		<div class="Box mb-3 tmp-mb-3 d-inline-block width-full">
			{#each list as issue (issue.url)}
				<div class="Box-row d-flex flex-items-center gap-2">
					<IssuePrIcon
						type={issue.__typename}
						state={issue.state}
						stateReason={issue.stateReason}
						isDraft={issue.isDraft}
					/>
					<a
						href={issue.url}
						class="Link--primary wb-break-word"
					>
						{issue.title}
					</a>
					<span class="color-fg-muted text-small flex-shrink-0">
						#{issue.number}
					</span>
				</div>
			{/each}
		</div>
	{/if}
{/await}
