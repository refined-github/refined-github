<script lang="ts">
	import type {Snippet} from 'svelte';

	type Props = {
		icon?: Snippet;
		text: Snippet;
		classes?: string[];
		action?: string | ((_event: MouseEvent) => void);
		buttonLabel?: Snippet | string;
	};

	const {icon, text, classes = [], action, buttonLabel}: Props = $props();

	const buttonClasses =
		'flex-shrink-0 btn btn-sm ml-sm-3 mt-2 mt-sm-n2 mb-sm-n2 mr-sm-n1 flex-self-center';
</script>

<div class={['flash', ...classes].join(' ')}>
	<div class="d-sm-flex flex-items-center gap-2">
		<div class="d-flex flex-auto flex-self-center flex-items-center gap-2">
			{#if icon}{@render icon()}{/if}
			<span>{@render text()}</span>
		</div>
		{#if action && buttonLabel}
			{#if typeof action === 'string'}
				<a href={action} class={buttonClasses}>
					{#if typeof buttonLabel === 'string'}{
							buttonLabel
						}{:else}{@render buttonLabel()}{/if}
				</a>
			{:else}
				<button type="button" class={buttonClasses} onclick={action}>
					{#if typeof buttonLabel === 'string'}{
							buttonLabel
						}{:else}{@render buttonLabel()}{/if}
				</button>
			{/if}
		{/if}
	</div>
</div>
