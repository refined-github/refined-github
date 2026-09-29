<script>
	import LockIcon from 'octicons-plain-react/Lock';

	import DomChef from '../components/dom-chef.svelte';
	import urlStore from '../components/url.js';
	import {getConversationNumber} from '../github-helpers/index.js';
	import isConversationLocked from '../github-helpers/is-conversation-locked.js';

	const conversationNumber = $derived.by(() => getConversationNumber($urlStore));
</script>

{#await isConversationLocked(conversationNumber) then isLocked}
	{#if isLocked}
		<span
			class="State d-flex flex-items-center flex-shrink-0 gap-1 rgh-locked-issue"
		>
			<DomChef as={LockIcon} />
			Locked
		</span>
	{/if}
{/await}

<style>
	.rgh-locked-issue {
		/* Match size on PRs https://github.com/refined-github/refined-github/issues/9911 */
		align-self: normal;
	}
</style>
