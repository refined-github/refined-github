<script lang="ts">
	import GitMergeIcon from 'octicons-plain-react/GitMerge';
	import GitPullRequestIcon from 'octicons-plain-react/GitPullRequest';
	import GitPullRequestClosedIcon from 'octicons-plain-react/GitPullRequestClosed';
	import GitPullRequestDraftIcon from 'octicons-plain-react/GitPullRequestDraft';
	import IssueClosedIcon from 'octicons-plain-react/IssueClosed';
	import IssueOpenedIcon from 'octicons-plain-react/IssueOpened';
	import SkipIcon from 'octicons-plain-react/Skip';

	import DomChef from './dom-chef.svelte';
	import getRelatedIssues, {type RelatedIssue} from './related-issues.js';

	const {featureId}: {featureId: string} = $props();

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

{#await getRelatedIssues(featureId) then {list}}
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
