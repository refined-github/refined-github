<svelte:options
	customElement={{
		tag: 'rgh-header',
		props: {
			title: {type: 'String', attribute: 'title'},
		},
	}}
/>

<!-- prettier-ignore -->
<script lang="ts">
	const {title}: {title: string} = $props();
</script>

<header>
	<div class="content">
		<h1>
			<img src="icon.png" alt="" height="32" />
			{title}
		</h1>
		<div>
			<slot />
		</div>
	</div>
</header>

<style>
	header {
		background-color: light-dark(#f6f8fa, #02040a);
		border-bottom: solid 1px light-dark(#d2d9e0, #3d444d);
		padding-block: 30px;
		padding-inline: var(--viewport-margin);
		display: grid;
		gap: 1em;

		& > * {
			width: 100%;
			max-width: var(--content-width);
			margin: auto;
		}
	}

	h1 {
		display: flex;
		gap: 0.4em;
		font-size: clamp(1.3em, 5vw, 2em);
		font-weight: 200;

		img {
			height: 1.3em;
			width: 1.3em;
		}
	}
</style>
