<script lang="ts">
	import type {Snippet} from 'svelte';

	type Props = {
		action: string | ((_event: MouseEvent) => void);
		children: Snippet;
	};

	const {action, children}: Props = $props();

	const buttonClasses =
		'flex-shrink-0 btn btn-sm ml-sm-3 mt-2 mt-sm-n2 mb-sm-n2 mr-sm-n1 flex-self-center';
</script>

{#if typeof action === 'string'}
	<a href={action} class={buttonClasses}>
		{@render children()}
	</a>
{:else if typeof action === 'function'}
	<button type="button" class={buttonClasses} onclick={action}>
		{@render children()}
	</button>
{/if}
