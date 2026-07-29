<script lang="ts">
	import * as pageDetect from 'github-url-detection';
	import InfoIcon from 'octicons-plain-react/Info';
	import twas from 'twas';

	import Banner from '../github-helpers/banner.svelte';
	import {buildRepoUrl} from '../github-helpers/index.js';
	import {whatToOpen} from '../helpers/netiquette-shared.js';

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
		This {pageDetect.isPR() ? 'PR' : 'issue'} was closed <strong>{
			twas(closingDate.getTime())
		}</strong>. Please consider opening a
		{#if whatToOpen() === 'both'}
			<a href={buildRepoUrl('issues/new/choose')}>new issue</a> or a <a
				href={buildRepoUrl('discussions/new/choose')}
			>new discussion</a>
		{:else if whatToOpen() === 'issues'}
			<a href={buildRepoUrl('issues/new/choose')}>new issue</a>
		{:else}
			<a href={buildRepoUrl('discussions/new/choose')}>new discussion</a>
		{/if}
		instead of leaving a comment here. If you want to say something helpful, you
		can leave a
		{#if revealed}
			comment
		{:else}
			<button type="button" class="btn-link" onclick={reveal}>comment</button>
		{/if}.
		<strong>Do not</strong> report issues here.
	{/snippet}
</Banner>
