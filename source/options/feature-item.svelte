<svelte:options
	customElement={{
		tag: 'feature-item',
		shadow: 'none',
	}}
/>

<script lang="ts">
	import {$$ as querySelectorAll} from 'select-dom';

	import DomChef from '../components/dom-chef.svelte';
	import {createRghIssueLink, getFeatureUrl} from '../helpers/rgh-links.js';

	const {id, description, screenshot, hotfixIssue}: {
		// eslint-disable-next-line no-undef
		id: FeatureId;
		description: string;
		screenshot?: string;
		hotfixIssue?: string;
	} = $props();

	const fieldId = $derived(`field-${id}`);
	let screenshotToggle = $state<HTMLInputElement>();

	function toggleScreenshot(event: MouseEvent): void {
		if (event.ctrlKey || event.metaKey || event.shiftKey) {
			return;
		}

		event.preventDefault();

		if (event.altKey) {
			// Global batch toggle across all instances
			const toggles = querySelectorAll('input.screenshot-toggle');
			for (const toggle of toggles) {
				toggle.checked = !toggle.checked;
				toggle.dispatchEvent(new Event('change', {bubbles: true}));
			}
		} else if (screenshotToggle) {
			// Local instance toggle
			screenshotToggle.checked = !screenshotToggle.checked;
		}
	}
</script>

<input
	type="checkbox"
	name={hotfixIssue ? null : `feature:${id}`}
	id={fieldId}
	class="feature-checkbox"
	disabled={Boolean(hotfixIssue)}
>
<div class="info">
	<label class="feature-name" for={fieldId}>{id}</label>
	{#if hotfixIssue}
		<span class="hotfix-notice">
			(Disabled due to <DomChef
				as={() => createRghIssueLink(hotfixIssue, true)}
			/>)
		</span>
	{/if}
	<a href={getFeatureUrl(id)} class="feature-link">source</a>
	<input
		bind:this={screenshotToggle}
		hidden
		type="checkbox"
		class="screenshot-toggle"
	>
	{#if screenshot}
		<a
			href={screenshot}
			class="screenshot-link"
			onclick={toggleScreenshot}
		>
			screenshot
		</a>
	{/if}
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	<div class="description">{@html description}</div>
	{#if screenshot}
		<img
			hidden
			src={screenshot}
			loading="lazy"
			class="screenshot"
			alt={`Screenshot of ${id} feature`}
		/>
	{/if}
</div>

<style>
	/* Note that :host is not available because we're not using shadow DOM */
	:global(feature-item):not([hidden]) {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 0 0.4em;
		padding: 0.5em 0;
	}

	:global(feature-item):first-of-type {
		padding-top: 0;
	}

	:global(feature-item):target {
		outline: solid 2px transparent;
		border-radius: var(--border-radius);
		animation-name: blink-border;
		animation-duration: 1.5s;
		animation-iteration-count: 2;
		scroll-margin-top: 64px;
	}

	@keyframes blink-border {
		50% {
			outline-color: #1f6feb;
		}
	}

	input[type='checkbox'] {
		flex-shrink: 0;
		scroll-margin-top: 64px;
	}

	.feature-checkbox:not(:checked) + .info .feature-name {
		text-decoration: line-through;
	}

	.feature-checkbox:disabled {
		&, & + .info {
			opacity: 50%;
		}
	}

	.info {
		flex: 1;
	}

	.description {
		opacity: 80%;
	}

	.feature-link {
		margin: 0 0.6em;
	}

	.screenshot {
		max-width: 100%;
		margin-bottom: 2em;
		border: 1px solid #d1d5da;
		border-radius: 0.5em;
		min-width: 2em;
		min-height: 2em;
	}

	.screenshot-toggle:checked ~ .screenshot-link {
		font-style: italic;
	}

	.screenshot-toggle:checked ~ .screenshot {
		display: block;
	}

	:global(.hotfix-notice),
	:global(.hotfix-notice a) {
		color: var(--rgh-red);
	}
</style>
