<svelte:options
	customElement={{
		tag: 'rgh-header',
		props: {
			title: {type: 'String', attribute: 'title'},
		},
	}}
/>

<!-- markup-fmt-ignore -->
<script lang="ts">
	const {title}: {title: string} = $props();
	const {version} = chrome.runtime.getManifest();
</script>

<header>
	<div class="content">
		<h1>
			<img src="icon.png" alt="" height="32" />
			{title} <small>v{version}</small>
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
		font-size: clamp(1.3em, 5vw, 2em);
		font-weight: 200;

		img {
			height: 1.3em;
			width: 1.3em;
			vertical-align: top;
		}

		small {
			font-size: 0.7em;
			opacity: 0.9;
		}
	}
</style>
