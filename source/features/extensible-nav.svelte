<script lang="ts">
	import DomChef from '../helpers/dom-chef.svelte';
	import {tabs} from '../helpers/extensible-nav-store.js';
</script>

<nav class="UnderlineNav px-4">
	<ul class="UnderlineNav-body">
		{#each $tabs as tab (tab.id)}
			<li>
				<a
					href={tab.href}
					class="UnderlineNav-item"
					class:selected={tab.selected}
				>
					<DomChef as={tab.icon} class="UnderlineNav-octicon" />
					{tab.label}
					{#if tab.counter}
						<span class="Counter">{tab.counter}</span>
					{/if}
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
