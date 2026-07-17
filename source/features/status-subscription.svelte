<script lang="ts">
	import BellIcon from 'octicons-plain-react/Bell';
	import BellSlashIcon from 'octicons-plain-react/BellSlash';
	import IssueReopenedIcon from 'octicons-plain-react/IssueReopened';

	import {multilineAriaLabel} from '../github-helpers/index.js';
	import DomChef from '../helpers/dom-chef.svelte';
	import Tooltip from '../helpers/tooltip.svelte';

	type SubscriptionStatus = 'none' | 'all' | 'status';

	interface Props {
		status: SubscriptionStatus;
		isLegacy: boolean;
		onNone?: () => void;
		onAll?: () => void;
		onStatus?: () => void;
	}

	const {status, isLegacy, onNone, onAll, onStatus}: Props = $props();

	const disabledProps = (active: boolean) =>
		active
			? {
				'aria-selected': true,
				tabindex: -1,
				style: 'pointer-events:none',
			}
			: {};
</script>

{#snippet button(
	id: string,
	value: string,
	icon: any,
	label: string,
	tooltipLabel: string,
	active: boolean,
	onclick: (() => void) | undefined,
)}
	<button
		{id}
		data-disable-with
		name="id"
		type={isLegacy ? 'submit' : 'button'}
		{value}
		class="btn btn-sm flex-1 BtnGroup-item"
		class:selected={active}
		aria-labelledby="{id}-tooltip"
		{...disabledProps(active)}
		{onclick}
	>
		<DomChef as={icon} />
		{label}
	</button>
	<Tooltip id="{id}-tooltip" htmlFor={id} label={tooltipLabel} direction="sw" />
{/snippet}

<svelte:element
	this={isLegacy ? 'div' : 'fieldset'}
	class="rgh-status-subscription BtnGroup d-flex width-full"
>
	<!-- markup-fmt-ignore for now -->
	{@render button('rgh-sub-none', 'unsubscribe', BellSlashIcon, 'None', 'Unsubscribe', status === 'none', onNone)}
	<!-- markup-fmt-ignore for now -->
	{@render button('rgh-sub-all', 'subscribe', BellIcon, 'All', 'Subscribe to all events', status === 'all', onAll)}
	<!-- markup-fmt-ignore for now -->
	{@render button('rgh-sub-status', 'subscribe_to_custom_notifications', IssueReopenedIcon, 'Status', multilineAriaLabel('Subscribe just to status changes', '(closing, reopening, merging)'), status === 'status', onStatus)}
</svelte:element>

{#if isLegacy}
	<input type="hidden" name="events[]" value="merged" />
	<input type="hidden" name="events[]" value="closed" />
	<input type="hidden" name="events[]" value="reopened" />
{/if}

<style>
	.rgh-status-subscription .btn {
		&:not(.selected) {
			color: var(--fgColor-muted, var(--color-fg-muted, fuchsia));
		}

		&.selected {
			border-color: var(
				--control-borderColor-emphasis,
				var(--color-accent-emphasis, fuchsia)
			);

			.octicon {
				color: var(--fgColor-default, var(--color-fg-default, fuchsia));
			}
		}
	}
</style>
