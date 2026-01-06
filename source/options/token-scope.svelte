<svelte:options
	customElement={{
		tag: 'token-scope',
		props: {
			name: {type: 'String', attribute: 'name'},
			state: {type: 'String', attribute: 'state'},
		},
	}}
/>

<!-- prettier-ignore -->
<script lang="ts">
	const {name, state}: {
		name: string;
		state?: 'valid' | 'invalid' | '';
	} = $props();
</script>

<li data-scope={name} data-validation={state}>
	<slot />
</li>
