<svelte:options customElement={{
	tag: 'rgh-header',
	props: {
		title: {type: 'String', attribute: 'title'},
	},
}} />

<link rel='stylesheet' href='header.css'>
<script lang='ts'>
	import './header.css';

	const {title}: {title: string} = $props();
</script>
<header>
	<div class='content'>
		<h1>
			<img src='icon.png' alt='' height='32'>
			{title}
		</h1>
		<div>
			<slot />
		</div>
	</div>
</header>
