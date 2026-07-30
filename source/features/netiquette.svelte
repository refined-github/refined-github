<script lang="ts">
	import cx from 'clsx';
	import * as pageDetect from 'github-url-detection';
	import FlameIcon from 'octicons-plain-react/Flame';
	import GitPullRequestDraftIcon from 'octicons-plain-react/GitPullRequestDraft';
	import InfoIcon from 'octicons-plain-react/Info';
	import {
		$optional as querySelector,
		countElements,
		elementExists,
	} from 'select-dom';

	import DomChef from '../components/dom-chef.svelte';
	import AncientIssueText from '../components/netiquette-ancient.svelte';
	import {userIsModerator} from '../github-helpers/get-user-permission.js';
	import {
		isOwnConversation,
		isRefinedGitHubRepo,
	} from '../github-helpers/index.js';
	import {getCloseDate, wasLongAgo} from '../github-helpers/netiquette.js';
	import looseParseInt from '../helpers/loose-parse-int.js';

	const {legacy}: {legacy?: boolean} = $props();

	const flashClass = $derived(
		cx(
			'd-flex flex-items-center gap-2 fgColor-muted bgColor-accent-muted',
			legacy ? 'tmp-p-2 p-2 m-2 rounded-2' : 'tmp-p-3 p-4 border-bottom',
		),
	);

	function isPopular(): boolean {
		return (
			// TODO: Update comment counter
			countElements('[data-testid="comment-header"]') > 30
			// This element only appears after 6 participants
			|| looseParseInt(
					querySelector('[aria-label*="other participants"]')?.ariaLabel,
				) > 20
			|| elementExists('[data-testid="issue-timeline-load-more-count-front"]')
			// TODO [2027-01-01]: Drop after the legacy PR view is removed
			|| countElements('.timeline-comment') > 30
		);
	}
</script>

{#if pageDetect.isDraftPR() && !isOwnConversation()}
	<div class={flashClass}>
		<DomChef as={GitPullRequestDraftIcon} />
		<span>This is a <strong>draft PR</strong>, it might not be ready for
			review.</span>
	</div>
{:else}
	{#if isPopular()}
		{#await userIsModerator() then isModerator}
			{#if !isModerator}
				<div class={flashClass}>
					<DomChef as={FlameIcon} />
					<span>This issue is highly active. Reconsider commenting unless you
						have read all the comments and have something to add.</span>
				</div>
			{/if}
		{/await}
	{/if}
	{#if !isRefinedGitHubRepo()}
		{#await getCloseDate() then date}
			<!-- rgh-netiquette takes care of old repos -->
			{#if date && wasLongAgo(date)}
				<div class={flashClass}>
					<DomChef as={InfoIcon} />
					<span><AncientIssueText closingDate={date} /></span>
				</div>
			{/if}
		{/await}
	{/if}
{/if}
