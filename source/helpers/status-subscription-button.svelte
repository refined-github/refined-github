<script lang="ts">
	import DomChef from './dom-chef.svelte';
	import Tooltip from './tooltip.svelte';

	interface Props {
		id: string;
		value: string;
		icon: (..._props: any[]) => HTMLElement;
		label: string;
		tooltipLabel: string;
		active: boolean;
		isLegacy: boolean;
		onclick?: () => void;
	}

	const {id, value, icon, label, tooltipLabel, active, isLegacy, onclick}: Props = $props();
</script>

<button
	{id}
	name="id"
	type={isLegacy ? 'submit' : 'button'}
	{value}
	class="btn btn-sm flex-1 BtnGroup-item"
	class:selected={active}
	aria-selected={active || undefined}
	aria-labelledby="{id}-tooltip"
	tabindex={active ? -1 : undefined}
	style:pointer-events={active ? 'none' : undefined}
	{onclick}
>
	<DomChef as={icon} />
	{label}
</button>
<Tooltip id="{id}-tooltip" htmlFor={id} label={tooltipLabel} direction="sw" />

<style>
		button:not(.selected) {
			color: var(--fgColor-muted, var(--color-fg-muted, fuchsia));
		}

		button.selected {
			border-color: var(
				--control-borderColor-emphasis,
				var(--color-accent-emphasis, fuchsia)
			);

			.octicon {
				color: var(--fgColor-default, var(--color-fg-default, fuchsia));
			}
		}
</style>
