<script lang="ts">
	import pluralize from '../helpers/pluralize.js';
	import lowQualityCount from '../components/hide-low-quality-comments-store.js';

	let shown = $state(false);
	const {onclick}: {onclick: () => void} = $props();
	const onshow = () => {
		shown = true;
		onclick();
	};
</script>

{#if !shown && $lowQualityCount}
	<p>
		{$lowQualityCount} unhelpful {
			pluralize($lowQualityCount, 'comment was', 'comments were')
		} automatically hidden.
		<button
			class="btn-link text-emphasized rgh-unhide-low-quality-comments"
			type="button"
			onclick={onshow}
		>
			Show
		</button>
	</p>
{/if}

<style>
	p {
		font-size: 12px;
		color: var(--fgColor-muted, var(--color-fg-muted, fuchsia));
	}
</style>
