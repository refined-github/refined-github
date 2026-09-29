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
		<span title="Locked" class="State d-flex flex-items-center flex-shrink-0">
			<DomChef as={LockIcon} class="flex-items-center mr-1 tmp-mr-1" />
			Locked
		</span>
	{/if}
{/await}
