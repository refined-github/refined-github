<script lang="ts">
	import type {Snippet} from 'svelte';

	import {upperCaseFirst} from '../github-helpers/index.js';
	import './tooltip.css';

	type TooltipOptions = {
		label: string;
		shortcut?: string;
		direction?: 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';
		type?: 'label' | 'description';
	};

	type Props = {
		content: string | TooltipOptions;
		children: Snippet<[targetId: string, tooltipId: string]>;
	};

	const {content, children}: Props = $props();
	const targetId = `rgh-${crypto.randomUUID()}`;
	const tooltipId = `rgh-${crypto.randomUUID()}`;

	const options = $derived.by(() => (
		typeof content === 'string'
			? {label: content}
			: content
	));
</script>

{@render children(targetId, tooltipId)}
<tool-tip
	id={tooltipId}
	class="sr-only position-absolute"
	for={targetId}
	popover="manual"
	data-direction={options.direction ?? 's'}
	data-type={options.type ?? 'label'}
	aria-hidden="true"
	role="tooltip"
>
	{options.label}
	{#if options.shortcut}
		<kbd class="rgh-shortcut">
			{#each options.shortcut.split(' ') as key, index (index)}
				{#if index > 0}
				 
				{/if}
				<span class="rgh-shortcut-chord" data-kbd-chord="true">
					{upperCaseFirst(key)}
				</span>
			{/each}
		</kbd>
	{/if}
</tool-tip>
