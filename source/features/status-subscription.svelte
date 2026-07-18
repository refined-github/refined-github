<script lang="ts">
	import BellIcon from 'octicons-plain-react/Bell';
	import BellSlashIcon from 'octicons-plain-react/BellSlash';
	import IssueReopenedIcon from 'octicons-plain-react/IssueReopened';
	import type {Readable} from 'svelte/store';

	import Button from '../helpers/status-subscription-button.svelte';
	import type {SubscriptionStatus} from './status-subscription.js';

	interface Props {
		status: Readable<SubscriptionStatus>;
		disabled: Readable<boolean>;
		isLegacy: boolean;
		onNone?: () => void;
		onAll?: () => void;
		onStatus?: () => void;
	}

	const {status, disabled, isLegacy, onNone, onAll, onStatus}: Props = $props();
</script>

<fieldset
	class="BtnGroup d-flex width-full"
	disabled={$disabled}
>
	<Button
		id="rgh-sub-none"
		value="unsubscribe"
		icon={BellSlashIcon}
		label="None"
		tooltip="Unsubscribe"
		active={$status === 'none'}
		{isLegacy}
		onclick={onNone}
	/>

	<Button
		id="rgh-sub-all"
		value="subscribe"
		icon={BellIcon}
		label="All"
		tooltip="Subscribe to all events"
		active={$status === 'all'}
		{isLegacy}
		onclick={onAll}
	/>

	<Button
		id="rgh-sub-status"
		value="subscribe_to_custom_notifications"
		icon={IssueReopenedIcon}
		label="Status"
		tooltip="Subscribe only to closing, reopening, merging"
		active={$status === 'status'}
		{isLegacy}
		onclick={onStatus}
	/>
</fieldset>

{#if isLegacy}
	<!-- Always submitted, but ignored unless the value is `subscribe_to_custom_notifications` -->
	<!-- Keep outside BtnGroup -->
	<input type="hidden" name="events[]" value="merged" />
	<input type="hidden" name="events[]" value="closed" />
	<input type="hidden" name="events[]" value="reopened" />
{/if}
