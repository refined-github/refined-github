<script lang="ts">
	import InfoIcon from 'octicons-plain-react/Info';

	import Banner from '../components/banner.svelte';
	import AncientIssueText from '../components/netiquette-ancient.svelte';

	const {closingDate, onReveal}: {closingDate: Date; onReveal: () => void} =
		$props();

	let revealed = $state(false);

	function reveal(): void {
		revealed = true;
		onReveal();
	}
</script>

<Banner classes={[revealed ? 'flash-error' : 'rgh-bg-none']} icon={InfoIcon}>
	{#snippet text()}
		<AncientIssueText closingDate={closingDate} /> If you want to say something
		helpful, you can leave a
		{#if revealed}
			comment
		{:else}
			<button type="button" class="btn-link" onclick={reveal}>comment</button>
		{/if}.
		<strong>Do not</strong> report issues here.
	{/snippet}
</Banner>
