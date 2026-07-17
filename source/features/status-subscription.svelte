<script lang="ts">
	import BellIcon from 'octicons-plain-react/Bell';
	import BellSlashIcon from 'octicons-plain-react/BellSlash';
	import IssueReopenedIcon from 'octicons-plain-react/IssueReopened';

	import {multilineAriaLabel} from '../github-helpers/index.js';
	import Button from '../helpers/status-subscription-button.svelte';

	type SubscriptionStatus = 'none' | 'all' | 'status';

	interface Props {
		status: SubscriptionStatus;
		isLegacy: boolean;
		onNone?: () => void;
		onAll?: () => void;
		onStatus?: () => void;
	}

	const {status, isLegacy, onNone, onAll, onStatus}: Props = $props();
</script>

<fieldset
	class="rgh-status-subscription BtnGroup d-flex width-full"
>
	<Button id="rgh-sub-none" value="unsubscribe" icon={BellSlashIcon} label="None" tooltipLabel="Unsubscribe" active={status === 'none'} {isLegacy} onclick={onNone} />
	<Button id="rgh-sub-all" value="subscribe" icon={BellIcon} label="All" tooltipLabel="Subscribe to all events" active={status === 'all'} {isLegacy} onclick={onAll} />
	<Button id="rgh-sub-status" value="subscribe_to_custom_notifications" icon={IssueReopenedIcon} label="Status" tooltipLabel={multilineAriaLabel('Subscribe just to status changes', '(closing, reopening, merging)')} active={status === 'status'} {isLegacy} onclick={onStatus} />
</fieldset>

{#if isLegacy}
	<input type="hidden" name="events[]" value="merged" />
	<input type="hidden" name="events[]" value="closed" />
	<input type="hidden" name="events[]" value="reopened" />
{/if}
