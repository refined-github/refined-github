<script lang="ts">
	import GitMergeIcon from 'octicons-plain-react/GitMerge';
	import GitPullRequestIcon from 'octicons-plain-react/GitPullRequest';
	import GitPullRequestClosedIcon from 'octicons-plain-react/GitPullRequestClosed';
	import GitPullRequestDraftIcon from 'octicons-plain-react/GitPullRequestDraft';
	import IssueClosedIcon from 'octicons-plain-react/IssueClosed';
	import IssueOpenedIcon from 'octicons-plain-react/IssueOpened';
	import SkipIcon from 'octicons-plain-react/Skip';

	import api from '../github-helpers/api.js';
	import {getExtensionReleaseDate} from '../helpers/extension-release-age.js';
	import {getFeatureRelatedIssuesQuery} from '../helpers/rgh-links.js';
	import DomChef from './dom-chef.svelte';
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

	function getStatus(
		issue: RelatedIssue,
	): {icon: (..._props: any[]) => HTMLElement; color: string; label: string} {
		if (issue.__typename === 'PullRequest') {
			if (issue.state === 'MERGED') {
				return {icon: GitMergeIcon, color: 'color-fg-done', label: 'Merged PR'};
			}

			if (issue.state === 'CLOSED') {
				return {
					icon: GitPullRequestClosedIcon,
					color: 'color-fg-closed',
					label: 'Closed PR',
				};
			}

			return issue.isDraft
				? {
					icon: GitPullRequestDraftIcon,
					color: 'color-fg-muted',
					label: 'Draft PR',
				}
				: {icon: GitPullRequestIcon, color: 'color-fg-open', label: 'Open PR'};
		}

		if (issue.state === 'OPEN') {
			return {icon: IssueOpenedIcon, color: 'color-fg-open', label: 'Open issue'};
		}

		return issue.stateReason === 'NOT_PLANNED'
			? {
				icon: SkipIcon,
				color: 'color-fg-muted',
				label: 'Issue closed as not planned',
			}
			: {icon: IssueClosedIcon, color: 'color-fg-done', label: 'Closed issue'};
	}
</script>

{#await listPromise then list}
	{#if list.length > 0}
		<div class="Box mb-3 tmp-mb-3 d-inline-block width-full">
			{#each list as issue (issue.url)}
				{@const status = getStatus(issue)}
				<div class="Box-row d-flex flex-items-center gap-2">
					<span
						class="flex-shrink-0 d-flex {status.color}"
						title={status.label}
					>
						<DomChef as={status.icon} />
					</span>
					<!-- Open in a new tab to avoid form content loss -->
					<a
						href={issue.url}
						target="_blank"
						rel="noopener noreferrer"
						class="Link--primary wb-break-word"
					>
						{issue.title}
					</a>
					<span class="color-fg-muted text-small flex-shrink-0">#{
							issue.number
						}</span>
				</div>
			{/each}
		</div>
	{/if}
{/await}
