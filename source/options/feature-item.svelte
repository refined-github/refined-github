<svelte:options
	customElement={{
		tag: 'feature-item',
		shadow: 'none',
	}}
/>

<script lang="ts">
	// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair -- https://github.com/eslint-community/eslint-plugin-eslint-comments/issues/327
	/* eslint-disable svelte/no-at-html-tags -- Not user-provided */
	import {getFeatureUrl} from '../helpers/rgh-links.js';

	const {id, description, screenshot}: {
		// eslint-disable-next-line no-undef
		id: FeatureId;
		description: string;
		screenshot?: string;
	} = $props();

	const fieldId = $derived(`field-${id}`);
</script>

<input
	type="checkbox"
	name={`feature:${id}`}
	id={fieldId}
	class="feature-checkbox"
>
<div class="info">
	<label class="feature-name" for={fieldId}>{id}</label>
	<a href={getFeatureUrl(id)} class="feature-link">source</a>
	<input hidden type="checkbox" class="screenshot-toggle">
	{#if screenshot}
		<a href={screenshot} class="screenshot-link">screenshot</a>
	{/if}
	<p class="description">{@html description}</p>
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

	p {
		margin-bottom: 0;
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
</style>
