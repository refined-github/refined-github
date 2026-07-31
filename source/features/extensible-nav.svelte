<script lang="ts">
	import DomChef from '../components/dom-chef.svelte';
	import TabCounter from '../components/extensible-nav-counter.svelte';
	import {selectedId, tabs} from '../components/extensible-nav-store.js';
	import Tooltip from '../components/tooltip.svelte';
</script>

<nav class="UnderlineNav rgh-extensible-nav px-4">
	<ul class="UnderlineNav-body">
		{#each $tabs as tab (tab.id)}
			{@const id = `rgh-extensible-nav-${tab.id}`}
			{@const isSelected = tab.id === $selectedId}
			{@const tooltip = tab.tooltip ?? (tab.noLabel ? tab.label : undefined)}
			<li>
				<a
					{id}
					href={tab.href}
					class="UnderlineNav-item"
					data-turbo-frame="repo-content-turbo-frame"
					data-react-nav={tab.reactNav}
					aria-labelledby={tooltip ? `${id}-tooltip` : undefined}

					class:selected={isSelected}
					// Keep visible if current tab
					hidden={tab.hidden && !isSelected}
				>
					<DomChef as={tab.icon} class="UnderlineNav-octicon" />
					<!-- Don't use [hidden] because Svelte won't render it at all -->
					<span class:d-none={tab.noLabel} data-content={tab.label}>{tab.label}</span>
					<TabCounter counter={tab.counter} />
				</a>
				{#if tooltip}
					<Tooltip id="{id}-tooltip" htmlFor={id} label={tooltip} />
				{/if}
			</li>
		{/each}
	</ul>
</nav>
<style>
	a {
		min-height: 1lh;
		gap: 8px;

		:global(svg, .Counter) {
			margin: 0;
		}
	}
</style>
