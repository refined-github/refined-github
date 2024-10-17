<svelte:options customElement={{
	tag: 'rgh-header',
	props: {
		title: {type: 'String', attribute: 'title'},
	},
}} />

<link rel='stylesheet' href='header.css'>
<script>
	import './header.css';

	export let title;
</script>
<header>
	<h1>
		<img src='icon.png' alt="" height='32'>
		{title}
	</h1>
	<div>
		<slot />
	</div>
</header>
