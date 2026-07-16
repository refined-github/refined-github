<script lang="ts">
	import {lastElement} from 'select-dom';

	import {upperCaseFirst} from '../github-helpers/index.js';
	import portal from '../helpers/portal.js';
	import type {TooltipOptions} from './tooltip.js';

	type Props = {
		id: string;
		for: string;
		options: TooltipOptions;
	};

	const {id, for: htmlFor, options}: Props = $props();

	function getTarget(): Element {
		// Align tooltip behavior with native
		// https://github.com/refined-github/refined-github/pull/9668
		return lastElement([
			'#js-repo-pjax-container',
			'#js-pjax-container',
			'#repo-content-turbo-frame',
			'#repo-content-pjax-container',
			'[data-turbo-body]', // User profile
		]);
	}
</script>

<tool-tip
	{id}
	class="sr-only position-absolute"
	for={htmlFor}
	popover="manual"
	data-direction={options.direction ?? 's'}
	data-type={options.type ?? 'label'}
	aria-hidden="true"
	role="tooltip"
	use:portal={getTarget}
>
	{options.label}
	{#if options.shortcut}
		<kbd class="rgh-shortcut">
			{#each options.shortcut.split(' ') as key, index (index)}
				{#if index > 0}{' '}{/if}<span class="rgh-shortcut-chord" data-kbd-chord="true">{upperCaseFirst(key)}</span>
			{/each}
		</kbd>
	{/if}
</tool-tip>

<style>
	/* Copied from: https://github.com/primer/react/blob/dfed7ca73532922ec0526dd85afcf7ae471c566e/packages/react/src/KeybindingHint/KeybindingHint.module.css */
	.rgh-shortcut {
		position: relative;
		padding: 0;
		margin-left: var(--base-size-6, 0.375rem);
		overflow: visible;
		font-family: inherit;
		font-size: inherit;
		line-height: unset;
		color: inherit;
		white-space: nowrap;
		vertical-align: baseline;
		background: none;
		border: none;
		box-shadow: none;
	}

	/* Adapted from: https://github.com/primer/react/blob/dfed7ca73532922ec0526dd85afcf7ae471c566e/packages/react/src/KeybindingHint/components/Chord.module.css */
	.rgh-shortcut-chord {
		display: inline-flex;
		border: var(--borderWidth-thin, 0.0625rem) solid;
		border-radius: var(--borderRadius-small, 0.1875rem);
		border-color: #0000;
		font-weight: var(--base-text-weight-normal, 400);
		font-size: 11px;
		gap: 0.5ch;
		box-shadow: none;
		vertical-align: baseline;
		overflow: hidden;
		justify-content: center;
		padding: var(--base-size-2, 0.125rem);
		line-height: var(--base-size-8, 0.5rem);
		min-width: var(--base-size-16, 1rem);
		color: var(--fgColor-onEmphasis, fuchsia);
		background: var(--counter-bgColor-emphasis, fuchsia);
	}
</style>
