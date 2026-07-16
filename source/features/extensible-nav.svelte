<script lang="ts">
	import DomChef from '../helpers/dom-chef.svelte';
	import TabCounter from '../helpers/extensible-nav-counter.svelte';
	import {selectedId, tabs} from '../helpers/extensible-nav-store.js';
</script>

<nav class="UnderlineNav rgh-extensible-nav px-4">
	<ul class="UnderlineNav-body">
		{#each $tabs as tab (tab.id)}
			<li>
				<a
					href={tab.href}
					class="UnderlineNav-item"
					class:selected={tab.id === $selectedId}
					class:tooltipped={tab.tooltip}
					// Temporarily "w" until tooltipped() is brought over to Svelte
					// TODO: https://github.com/refined-github/refined-github/issues/9810
					class:tooltipped-w={tab.tooltip}
					aria-label={tab.tooltip}
				>
					<DomChef as={tab.icon} class="UnderlineNav-octicon" />
					<span class="rgh-extensible-nav-label">{tab.label}</span>
					<TabCounter counter={tab.counter} />
				</a>
			</li>
		{/each}
	</ul>
</nav>
<style>
	nav {
		/* Temporary indicator of successful replacement */
		/* TODO: Remove after https://github.com/refined-github/refined-github/issues/8867 is completed */
		border-left: 1px solid var(--borderColor-muted, fuchsia);
	}
</style>
