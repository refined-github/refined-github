<script lang="ts">
	import DomChef from '../components/dom-chef.svelte';
	import TabCounter from '../components/extensible-nav-counter.svelte';
	import {selectedId, tabs} from '../components/extensible-nav-store.js';
	import Tooltip from '../components/tooltip.svelte';
</script>

<nav class="UnderlineNav rgh-extensible-nav d-none px-4">
	<ul class="UnderlineNav-body">
		{#each $tabs as tab (tab.id)}
			{@const id = `rgh-extensible-nav-${tab.id}`}
			<li>
				<a
					{id}
					href={tab.href}
					class="UnderlineNav-item"
					data-turbo-frame="repo-content-turbo-frame"
					data-react-nav={tab.reactNav}
					class:selected={tab.id === $selectedId}
					aria-labelledby={tab.tooltip ? `${id}-tooltip` : undefined}
				>
					<DomChef as={tab.icon} class="UnderlineNav-octicon" />
					<span data-content={tab.label}>{tab.label}</span>
					<TabCounter counter={tab.counter} />
				</a>
				{#if tab.tooltip}
					<Tooltip id="{id}-tooltip" htmlFor={id} label={tab.tooltip} />
				{/if}
			</li>
		{/each}
	</ul>
</nav>
<style>
</style>
