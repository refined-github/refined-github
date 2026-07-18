<script lang="ts">
	import DomChef from './dom-chef.svelte';
	import Tooltip from './tooltip.svelte';

	interface Props {
		id: string;
		value: string;
		icon: (..._props: any[]) => HTMLElement;
		label: string;
		tooltip: string;
		active: boolean;
		isLegacy: boolean;
		onclick?: () => void;
	}

	const {id, value, icon, label, tooltip, active, isLegacy, onclick}: Props =
		$props();
</script>

<button
	{id}
	{value}
	name="id"
	type={isLegacy ? 'submit' : 'button'}
	data-disable-with={isLegacy ? '' : undefined}
	class="btn btn-sm flex-1 BtnGroup-item"
	aria-labelledby="{id}-tooltip"
	// Make the element look selected, not disabled, but effectively disable clicks/focus
	class:selected={active}
	tabindex={active ? -1 : undefined}
	style:pointer-events={active ? 'none' : undefined}
	{onclick}
>
	<DomChef as={icon} />
	{label}
</button>
<Tooltip id="{id}-tooltip" htmlFor={id} label={tooltip} />

<style>
	button:not(.selected) {
		color: var(--fgColor-muted, var(--color-fg-muted, fuchsia));
	}

	button.selected {
		border-color: var(
			--control-borderColor-emphasis,
			var(--color-accent-emphasis, fuchsia)
		);

		:global(svg) {
			color: var(--fgColor-default, var(--color-fg-default, fuchsia));
		}
	}
</style>
