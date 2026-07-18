<script lang="ts">
	import type {Snippet} from 'svelte';
	import type {RequireAllOrNone} from 'type-fest';

	import Dom from './dom-chef.svelte';

	type Props = RequireAllOrNone<{
		icon?: (..._props: any[]) => HTMLElement;
		text: Snippet;
		classes?: string[];
		action: string | ((_event: MouseEvent) => void);
		buttonLabel: Snippet;
	}, 'action' | 'buttonLabel'>;

	const {icon, text, classes = [], action, buttonLabel}: Props = $props();

	const buttonClasses =
		'flex-shrink-0 btn btn-sm ml-sm-3 mt-2 mt-sm-n2 mb-sm-n2 mr-sm-n1 flex-self-center';
</script>

<div class={['flash', ...classes].join(' ')}>
	<div class="d-sm-flex flex-items-center gap-2">
		<div class="d-flex flex-auto flex-self-center flex-items-center gap-2">
			{#if icon}<Dom as={icon} class="mr-0 tmp-mr-0" />{/if}
			<span>{@render text()}</span>
		</div>
		{#if typeof action === 'string'}
			<a href={action} class={buttonClasses}>
				{@render buttonLabel()}
			</a>
		{:else if typeof action === 'function'}
			<button type="button" class={buttonClasses} onclick={action}>
				{@render buttonLabel()}
			</button>
		{/if}
	</div>
</div>
