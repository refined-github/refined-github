<script lang="ts">
	const {element}: {element: {remove(): void}} = $props();

	function mountElement(anchor: {replaceWith(_node: typeof element): void}): {destroy(): void} {
		anchor.replaceWith(element);
		return {
			destroy() {
				element.remove();
			},
		};
	}
</script>

<span use:mountElement></span>
