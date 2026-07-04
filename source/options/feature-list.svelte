<svelte:options
	customElement={{
		tag: 'feature-list',
		shadow: 'none',
	}}
/>

<script lang="ts">
	import domify from 'doma';
	import {closestElement} from 'select-dom';

	import {featuresMeta, importedFeatures} from '../feature-data.js';
	import {getLocalHotfixes} from '../helpers/hotfix.js';
	import {createRghIssueLink, getFeatureUrl} from '../helpers/rgh-links.js';

	const host = $host();
	const features = featuresMeta.filter(feature =>
		importedFeatures.includes(feature.id)
	);

	let hotfixes = $state(new Map<string, number>());
	let filter = $state('');
	let offCount = $state(0);

	function keywordsOf(value: string): string[] {
		return value.toLowerCase().replaceAll(/\W/g, ' ').split(/\s+/).filter(
			Boolean,
		);
	}

	function isHidden(text: string): boolean {
		return keywordsOf(filter).some(word => !text.includes(word));
	}

	function updateOffCount(): void {
		offCount = host.querySelectorAll('.feature-checkbox:not(:checked)').length;
	}

	function sort(): void {
		const container = host.querySelector('.js-features')!;
		const items = [...container.querySelectorAll<HTMLElement>('.feature')]
			.toSorted((a, b) => a.dataset.text!.localeCompare(b.dataset.text!));
		const grouped = Object.groupBy(items, item => {
			const checkbox = item.querySelector<HTMLInputElement>(
				'input.feature-checkbox',
			)!;
			return checkbox.checked ? 'on' : checkbox.disabled ? 'broken' : 'off';
		});

		for (const group of [grouped.off, grouped.broken, grouped.on]) {
			if (group) {
				for (const item of group) {
					container.append(item);
				}
			}
		}
	}

	function toggleScreenshot(event: MouseEvent): void {
		if (event.ctrlKey || event.metaKey || event.shiftKey) {
			return;
		}

		event.preventDefault();
		if (event.altKey) {
			for (
				const toggle of host.querySelectorAll<HTMLInputElement>(
					'input.screenshot-toggle',
				)
			) {
				toggle.checked = !toggle.checked;
			}
		} else {
			const toggle = closestElement(
				'.feature',
				event.currentTarget as HTMLElement,
			)!
				.querySelector<HTMLInputElement>('input.screenshot-toggle')!;
			toggle.checked = !toggle.checked;
		}
	}

	function mount(element: HTMLElement, node: Node): {destroy(): void} {
		element.append(node);
		return {
			destroy() {
				node.parentNode?.removeChild(node);
			},
		};
	}

	host.addEventListener('sync', () => {
		sort();
		updateOffCount();
	});

	void getLocalHotfixes().then(entries => {
		hotfixes = new Map(
			entries.filter(([feature]) => importedFeatures.includes(feature)),
		);
		updateOffCount();
		host.dispatchEvent(new Event('ready'));
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
			{#each features as feature (feature.id)}
				{@const issue = hotfixes.get(feature.id)}
				{@const text = `${feature.id} ${feature.description}`.toLowerCase()}
				<div class="feature" data-text={text} hidden={isHidden(text)}>
					<input
						type="checkbox"
						name={issue ? undefined : `feature:${feature.id}`}
						id={feature.id}
						class="feature-checkbox"
						disabled={Boolean(issue)}
						onchange={updateOffCount}
					>
					<div class="info">
						<label class="feature-name" for={feature.id}>{feature.id}</label>
						<a href={getFeatureUrl(feature.id)} class="feature-link">source</a>
						<input hidden type="checkbox" class="screenshot-toggle">
						{#if feature.screenshot}
							<a
								href={feature.screenshot}
								class="screenshot-link"
								onclick={toggleScreenshot}
							>screenshot</a>
						{/if}
						{#if issue}
							<span class="hotfix-notice">
								(Disabled due to <span
									use:mount={createRghIssueLink(issue, true)}
								></span>)</span>
						{/if}
						<p class="description" use:mount={domify(feature.description)}></p>
						{#if feature.screenshot}
							<img
								hidden
								src={feature.screenshot}
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
