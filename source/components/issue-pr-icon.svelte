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

	const isPR = $derived(type === 'PullRequest');
	const isOpen = $derived(state === 'OPEN');
	const isMerged = $derived(state === 'MERGED');
	const isNotPlanned = $derived(stateReason === 'NOT_PLANNED');

	const icon = $derived(
		isPR
			? isMerged
				? GitMergeIcon
				: isOpen
				? isDraft
					? GitPullRequestDraftIcon
					: GitPullRequestIcon
				: GitPullRequestClosedIcon
			: isOpen
			? IssueOpenedIcon
			: isNotPlanned
			? SkipIcon
			: IssueClosedIcon,
	);

	const color = $derived(
		isOpen && !(isPR && isDraft)
			? 'color-fg-open'
			: isMerged || (!isPR && !isNotPlanned)
			? 'color-fg-done'
			: isPR && !isOpen
			? 'color-fg-closed'
			: 'color-fg-muted',
	);
</script>

<span class="flex-shrink-0 d-flex {color}">
	<DomChef as={icon} />
</span>
