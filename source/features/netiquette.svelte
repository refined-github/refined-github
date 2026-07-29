<script lang="ts">
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
		areDiscussionsEnabled,
		areIssuesEnabled,
		isOwnConversation,
	} from '../github-helpers/index.js';
	import {getCloseDate, wasLongAgo} from '../github-helpers/netiquette.js';
	import looseParseInt from '../helpers/loose-parse-int.js';

	const flashClass =
		'flash d-flex flex-items-center gap-2 p-3 text-small color-fg-muted rounded-0 border-0 m-0';
	function isPopular(): boolean {
		return (
			countElements('[data-testid="comment-header"]') > 30
			// This element only appears after 6 participants
			|| looseParseInt(
					querySelector('[aria-label*="other participants"]')?.ariaLabel,
				) > 30
			|| elementExists('[data-testid="issue-timeline-load-more-count-front"]')
			// TODO [2027-01-01]: Drop after the legacy PR view is removed
			|| countElements('.timeline-comment') > 30
			|| countElements('.participant-avatar') > 10
		);
	}

	const isDraft = pageDetect.isDraftPR() && !isOwnConversation();
	const closingDate = pageDetect.isConversation()
		? getCloseDate()
		: Promise.resolve(undefined);
	const isPopularAndAllowed =
		(async () => isPopular() && !(await userIsModerator()))();
</script>

{#if isDraft}
	<div class={flashClass}>
		<DomChef as={GitPullRequestDraftIcon} class="m-0 tmp-m-0" />
		<span>This is a <strong>draft PR</strong>, it might not be ready for
			review.</span>
	</div>
{:else}
	{#await closingDate then date}
		{#if date && wasLongAgo(date) && (areIssuesEnabled() || areDiscussionsEnabled())}
			<div class={flashClass}>
				<DomChef as={InfoIcon} class="m-0 tmp-m-0" />
				<span><AncientIssueText closingDate={date} /></span>
			</div>
		{:else}
			{#await isPopularAndAllowed then popular}
				{#if popular}
					<div class={flashClass}>
						<DomChef as={FlameIcon} class="m-0 tmp-m-0" />
						<span>This issue is highly active. Reconsider commenting unless you
							have read all the comments and have something to add.</span>
					</div>
				{/if}
			{/await}
		{/if}
	{/await}
{/if}
