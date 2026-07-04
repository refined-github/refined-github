<svelte:options
	customElement={{
		tag: 'feature-list',
		shadow: 'none',
	}}
/>

<script lang="ts">
	// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
	/* eslint-disable unicorn/no-computed-property-existence-check, svelte/no-at-html-tags -- Not user-provided */

	import {featuresMeta, importedFeatures} from '../feature-data.js';
	import {getLocalHotfixes} from '../helpers/hotfix.js';
	import {createRghIssueLink, getFeatureUrl} from '../helpers/rgh-links.js';

	const root = $host();
	const features = featuresMeta.filter(feature =>
		importedFeatures.includes(feature.id)
	);

	let hotfixes = $state(new Map<string, number>());
	let filter = $state('');
	const checked = $state<Record<string, boolean>>(
		Object.fromEntries(features.map(feature => [feature.id, false])),
	);
	const showScreenshot = $state<Record<string, boolean>>({});
	const checkboxReferences: Record<string, HTMLInputElement> = {};

	function keywordsOf(value: string): string[] {
		return value.toLowerCase().replaceAll(/\W/g, ' ').split(/\s+/).filter(
			Boolean,
		);
	}

	function isHidden(text: string): boolean {
		return keywordsOf(filter).some(word => !text.includes(word));
	}

	const rows = $derived.by(() => {
		const enriched = features.map(feature => {
			const issue = hotfixes.get(feature.id);
			const text = `${feature.id} ${feature.description}`.toLowerCase();
			return {feature, issue, text, hidden: isHidden(text)};
		});

		const sorted = enriched.toSorted((a, b) => a.text.localeCompare(b.text));
		const groups = Object.groupBy(
			sorted,
			row => row.issue ? 'broken' : checked[row.feature.id] ? 'on' : 'off',
		);

		return [...groups.off ?? [], ...groups.broken ?? [], ...groups.on ?? []];
	});

	const offCount = $derived(
		features.filter(feature => !checked[feature.id]).length,
	);

	function toggleScreenshot(id: string, event: MouseEvent): void {
		if (event.ctrlKey || event.metaKey || event.shiftKey) {
			return;
		}

		event.preventDefault();
		if (event.altKey) {
			const next = !showScreenshot[id];
			for (const feature of features) {
				if (feature.screenshot) {
					showScreenshot[feature.id] = next;
				}
			}
		} else {
			showScreenshot[id] = !showScreenshot[id];
		}
	}

	function mount(element: HTMLElement, node: Element): {destroy(): void} {
		element.append(node);
		return {
			destroy() {
				node.remove();
			},
		};
	}

	function handleSync(): void {
		for (const feature of features) {
			const element = checkboxReferences[feature.id];
			if (element) {
				checked[feature.id] = element.checked;
			}
		}
	}

	root.addEventListener('sync', handleSync);

	// eslint-disable-next-line unicorn/prefer-top-level-await -- bug
	getLocalHotfixes().then(entries => {
		hotfixes = new Map(
			entries
				.filter(([feature]) => importedFeatures.includes(feature))
				.map(([feature, issue]) => [feature, Number(issue)] as const),
		);
		root.dispatchEvent(new Event('ready'));
	});
</script>

<details id="features">
	<summary>
		<strong class="features-header">
			🔋 Features: {features.length + 25}
			{#if offCount > 0}
				({
					offCount === features.length
					? 'JS off… are you breaking up with me?'
					: `${offCount} off`
				})
			{/if}
		</strong>
	</summary>
	<div>
		<p>
			<input
				type="text"
				placeholder="Find features"
				spellcheck="false"
				autocomplete="off"
				autocapitalize="off"
				bind:value={filter}
			>
			<small>Use the "Identify feature" section below if you can't find what
				you're looking for.</small>
		</p>
		<div class="js-features">
			{#each rows as {feature, issue, text, hidden} (feature.id)}
				<div class="feature" data-text={text} {hidden}>
					<input
						type="checkbox"
						name={issue ? undefined : `feature:${feature.id}`}
						id={feature.id}
						class="feature-checkbox"
						disabled={Boolean(issue)}
						bind:checked={checked[feature.id]}
						bind:this={checkboxReferences[feature.id]}
					>
					<div class="info">
						<label class="feature-name" for={feature.id}>{feature.id}</label>
						<a href={getFeatureUrl(feature.id)} class="feature-link">source</a>
						{#if feature.screenshot}
							<a
								href={feature.screenshot}
								style={showScreenshot[feature.id] ? 'font-style: italic' : ''}
								onclick={event => toggleScreenshot(feature.id, event)}
							>screenshot</a>
						{/if}
						{#if issue}
							<span class="hotfix-notice">
								(Disabled due to <span
									use:mount={createRghIssueLink(issue, true)}
								></span>)</span>
						{/if}
						<p class="description">{@html feature.description}</p>
						{#if feature.screenshot}
							<img
								hidden={!showScreenshot[feature.id]}
								src={feature.screenshot}
								alt="Screenshot of the feature"
								loading="lazy"
								class="screenshot"
							>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>
</details>

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

	.feature-checkbox:not(:checked) + .info .feature-name {
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
