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

<style>
	li {
		padding-left: 1.8em;
		margin-bottom: 0.3em;
	}

	li::before {
		content: url('data:image/svg+xml; utf8, <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" fill="gray" d="M8 5.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM4 8a4 4 0 118 0 4 4 0 01-8 0z"></path></svg>');
		width: 16px;
		height: 16px;
		vertical-align: -4px;
		margin-right: 0.8em;
		margin-left: -1.8em; /* Pull out */
		display: inline-block;
	}

	li[data-validation='valid']::before {
		content: url('data:image/svg+xml; utf8, <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" fill="%2328a745" d="M8 16A8 8 0 108 0a8 8 0 000 16zm3.78-9.72a.75.75 0 00-1.06-1.06L6.75 9.19 5.28 7.72a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l4.5-4.5z"></path></svg>');
	}

	li[data-validation='invalid']::before {
		content: url('data:image/svg+xml; utf8, <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" fill="%23cb2431" d="M1.5 8a6.5 6.5 0 0110.535-5.096l-9.131 9.131A6.472 6.472 0 011.5 8zm2.465 5.096a6.5 6.5 0 009.131-9.131l-9.131 9.131zM8 0a8 8 0 100 16A8 8 0 008 0z"></path></svg>');
	}
</style>
