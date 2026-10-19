<script lang="ts">
	import type {Snippet} from 'svelte';

	import DomChef from './dom-chef.svelte';

	const {icon, text, classes = [], children}: {
		icon?: (..._props: any[]) => HTMLElement;
		text: Snippet;
		classes?: string[];
		children?: Snippet;
	} = $props();
</script>

<div class="flash {classes.join(' ')}">
	<div class="d-flex flex-wrap flex-items-center gap-2">
		<div class="d-flex flex-auto flex-self-center flex-items-baseline gap-2">
			{#if icon}
				<DomChef
					as={icon}
					class="mr-0 tmp-mr-0"
					style={{translate: '0 3px'}}
				/>
			{/if}
			<span>{@render text()}</span>
		</div>

		{#if children}
			{@render children()}
		{/if}
	</div>
</div>
