<script lang="ts">
	import {isClosedConversation} from 'github-url-detection';

	import {
		getConversationAuthor,
		getLoggedInUser,
	} from '../github-helpers/index.js';
	import Tooltip from '../helpers/tooltip.svelte';
	import {getToken} from '../options-storage.js';

	interface Props {
		onReview?: (_event: MouseEvent) => void;
		onApprove: (_event: MouseEvent) => void;
		onPreload?: () => void;
	}

	const {onReview, onApprove, onPreload}: Props = $props();

	const canApprovePromise =
		// Can't approve own PRs and closed PRs
		getLoggedInUser() !== getConversationAuthor()
		&& !isClosedConversation()
		// API required for this action
		&& getToken();

	const reviewId = 'rgh-quick-review';
	const approveId = 'rgh-quick-approve';
</script>

<span class="text-normal color-fg-muted">
	–
	<a
		id={reviewId}
		href={location.pathname + `/files#review-changes-modal`}
		class="rgh-quick-review btn-link Link--muted Link--inTextBlock"
		data-turbo-frame="repo-content-turbo-frame"
		data-hotkey="v"
		onmouseenter={onPreload}
		onclick={onReview}
		aria-labelledby="{reviewId}-tooltip"
	>
		review now
	</a>
	<Tooltip
		id="{reviewId}-tooltip"
		htmlFor={reviewId}
		label="Review now"
		shortcut="v"
	/>

	{#await canApprovePromise then canApprove}
		{#if canApprove}
			–
			<button
				id={approveId}
				type="button"
				class="btn-link Link--muted Link--inTextBlock rgh-quick-approve"
				onclick={onApprove}
				aria-labelledby="{approveId}-tooltip"
			>
				approve now
			</button>
			<Tooltip
				id="{approveId}-tooltip"
				htmlFor={approveId}
				label="Hold alt to approve without confirmation"
			/>
		{/if}
	{/await}
</span>
