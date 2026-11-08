<script lang="ts">
	import CheckIcon from 'octicons-plain-react/Check';
	import FileDiffIcon from 'octicons-plain-react/FileDiff';
	import XIcon from 'octicons-plain-react/X';

	import DomChef from '../components/dom-chef.svelte';
	import Tooltip from '../components/tooltip.svelte';

	type Choice = {
		value: string;
		label: string;
		description: string;
		disabled: boolean;
	};

	type Props = {
		choices: Choice[];
		// Copied from the native buttons to match their look
		classes: {button: string; content: string; label: string};
		onSubmit: (_value: string) => void;
		onRestore: () => void;
	};

	const {choices, classes, onSubmit, onRestore}: Props = $props();

	const icons: Record<string, {icon: typeof CheckIcon; color: string}> = {
		approve: {icon: CheckIcon, color: 'color-fg-success'},
		'request changes': {icon: FileDiffIcon, color: 'color-fg-danger'},
	};
</script>

{#each choices as {value, label, description, disabled} (value)}
	{@const id = `rgh-one-click-review-${value.replaceAll(' ', '-')}`}
	{@const icon = icons[value]}
	<button
		{id}
		type="button"
		class={classes.button}
		data-component="Button"
		data-size="medium"
		data-variant="default"
		{disabled}
		onclick={() => {
			onSubmit(value);
		}}
	>
		<span
			data-component="buttonContent"
			data-align="center"
			class={classes.content}
		>
			<span data-component="text" class={classes.label}>
				{#if icon && !disabled}
					<DomChef as={icon.icon} class="{icon.color} mr-1" />
				{/if}
				{label}
			</span>
		</span>
	</button>
	{#if description}
		<Tooltip
			id="{id}-tooltip"
			htmlFor={id}
			label={description}
			type="description"
		/>
	{/if}
{/each}

<!-- Last safety hatch: bring back the native controls if this ever misbehaves -->
<button
	id="rgh-one-click-review-restore"
	type="button"
	class="btn-link Link--muted"
	onclick={onRestore}
>
	<DomChef as={XIcon} />
</button>
<Tooltip
	id="rgh-one-click-review-restore-tooltip"
	htmlFor="rgh-one-click-review-restore"
	label="Restore GitHub’s review options"
/>
