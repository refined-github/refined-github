<script lang="ts">
	import React from 'dom-chef';
	import type {Action} from 'svelte/action';

	// eslint-disable-next-line svelte/no-unused-svelte-ignore
	// svelte-ignore custom_element_props_identifier -- No custom element here
	const {as, ...props}: {
		as: (..._props: any[]) => HTMLElement;
		[key: string]: unknown;
	} = $props();

	const mount: Action<HTMLElement> = (node) => {
		const element = React.createElement(as, props);
		if (element instanceof DocumentFragment) {
			throw new TypeError('The component must return a single root element');
		}

		node.replaceWith(element);
		return {destroy: () => element.remove()};
	};
</script>
<span use:mount></span>
