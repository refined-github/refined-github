<script lang="ts">
	import GitMergeIcon from 'octicons-plain-react/GitMerge';
	import GitPullRequestIcon from 'octicons-plain-react/GitPullRequest';
	import GitPullRequestClosedIcon from 'octicons-plain-react/GitPullRequestClosed';
	import GitPullRequestDraftIcon from 'octicons-plain-react/GitPullRequestDraft';
	import IssueClosedIcon from 'octicons-plain-react/IssueClosed';
	import IssueOpenedIcon from 'octicons-plain-react/IssueOpened';
	import SkipIcon from 'octicons-plain-react/Skip';

	import DomChef from './dom-chef.svelte';

	type Props = {
		type: 'Issue' | 'PullRequest';
		state: 'OPEN' | 'CLOSED' | 'MERGED';
		stateReason?: 'COMPLETED' | 'NOT_PLANNED' | 'REOPENED' | 'DUPLICATE';
		isDraft?: boolean;
	};

	const {type, state, stateReason, isDraft}: Props = $props();

	const status = $derived.by(
		(): {
			icon: (..._props: any[]) => HTMLElement;
			color: string;
			label: string;
		} => {
			if (type === 'PullRequest') {
				if (state === 'MERGED') {
					return {icon: GitMergeIcon, color: 'color-fg-done', label: 'Merged PR'};
				}

				if (state === 'CLOSED') {
					return {
						icon: GitPullRequestClosedIcon,
						color: 'color-fg-closed',
						label: 'Closed PR',
					};
				}

				return isDraft
					? {
						icon: GitPullRequestDraftIcon,
						color: 'color-fg-muted',
						label: 'Draft PR',
					}
					: {icon: GitPullRequestIcon, color: 'color-fg-open', label: 'Open PR'};
			}

			if (state === 'OPEN') {
				return {icon: IssueOpenedIcon, color: 'color-fg-open', label: 'Open issue'};
			}

			return stateReason === 'NOT_PLANNED'
				? {
					icon: SkipIcon,
					color: 'color-fg-muted',
					label: 'Issue closed as not planned',
				}
				: {icon: IssueClosedIcon, color: 'color-fg-done', label: 'Closed issue'};
		},
	);
</script>

<span class="flex-shrink-0 {status.color}" title={status.label}>
	<DomChef as={status.icon} />
</span>
