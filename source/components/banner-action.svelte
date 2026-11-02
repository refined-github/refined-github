<script lang="ts">
	import type {Snippet} from 'svelte';

	const {action, children}: {
		action: string | ((_event: MouseEvent) => void);
		children: Snippet;
	} = $props();

	const buttonClasses = 'flex-shrink-0 btn btn-sm flex-self-center';
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
