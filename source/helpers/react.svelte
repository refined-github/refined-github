<script lang="ts">
	import React from 'dom-chef';

	const {use, props = {}}: {use: (_props?: Record<string, unknown>) => {outerHTML: string}; props?: Record<string, unknown>} = $props();

	const html = $derived(React.createElement(use, props).outerHTML);
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html html}
