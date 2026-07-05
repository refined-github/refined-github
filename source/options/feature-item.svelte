<script lang="ts">
	import {tick} from 'svelte';
	// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair -- https://github.com/eslint-community/eslint-plugin-eslint-comments/issues/327
	/* eslint-disable svelte/no-at-html-tags -- Not user-provided */
	import DomChef from '../helpers/dom-chef.svelte';
	import {createRghIssueLink, getFeatureUrl} from '../helpers/rgh-links.js';

	let {
		feature,
		issue,
		hidden,
		ref = $bindable(),
		onchange,
	}: {
		// eslint-disable-next-line no-undef
		feature: FeatureMeta;
		issue?: number;
		hidden: boolean;
		ref?: HTMLInputElement;
		onchange?: () => void;
	} = $props();

	let showScreenshot = $state(false);
	let checked = $state(false);

	$effect(() => {
		if (!issue) {
			return;
		}

		// The item is disabled and unchecked when there's an issue
		checked = false;
		ref!.checked = false;
	});

	function toggle(event: MouseEvent): void {
		if (event.ctrlKey || event.metaKey || event.shiftKey) {
			return;
		}

		event.preventDefault();
		showScreenshot = !showScreenshot;
	}
</script>

<div
	class="feature"
	data-text={`${feature.id} ${feature.description}`.toLowerCase()}
	{hidden}
>
	<input
		type="checkbox"
		name={issue ? undefined : `feature:${feature.id}`}
		id={feature.id}
		class="feature-checkbox"
		disabled={Boolean(issue)}
		bind:this={ref}
		bind:checked
		{onchange}
	>
	<div class="info">
		<label class="feature-name" class:disabled={!checked} for={feature.id}>{
			feature.id
		}</label>
		<a href={getFeatureUrl(feature.id)} class="feature-link">source</a>
		{#if feature.screenshot}
			<a
				href={feature.screenshot}
				style={showScreenshot ? 'font-style: italic' : ''}
				onclick={toggle}
			>screenshot</a>
		{/if}
		{#if issue}
			<span class="hotfix-notice">
				(Disabled due to <DomChef as={() => createRghIssueLink(issue, true)} />)
			</span>
		{/if}
		<p class="description">{@html feature.description}</p>
		{#if feature.screenshot}
			<img
				hidden={!showScreenshot}
				src={feature.screenshot}
				alt="Screenshot of the feature"
				loading="lazy"
				class="screenshot"
			>
		{/if}
	</div>
</div>

<style>
	.feature:not([hidden]) {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 0 0.4em;

		padding: 0.5em 0;
		&:first-of-type {
			padding-top: 0;
		}
		p {
			margin-bottom: 0;
		}

		border-radius: var(--border-radius);
		outline: solid 2px transparent;
		&:has(> :target) {
			animation-name: blink-border;
			animation-duration: 1.5s;
			animation-iteration-count: 2;
		}
	}

	@keyframes blink-border {
		50% {
			outline-color: #1f6feb;
		}
	}

	.feature input[type='checkbox'] {
		flex-shrink: 0;
		scroll-margin-top: 64px;
	}

	.feature-name.disabled {
		text-decoration: line-through;
	}

	.feature:has(.feature-checkbox:disabled) > *:not(.hotfix-notice) {
		opacity: 50%;
	}

	.feature .info {
		flex: 1;
	}

	.feature .description {
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
</style>
