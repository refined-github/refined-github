<svelte:options customElement="rgh-graphql" />

<script lang="ts">
	import 'webext-base-css/webext-base.css';

	import api from './github-helpers/api.js';

	let query = $state(`viewer {
	login
}`);
	let variablesJson = $state('');
	let responseJson = $state('');
	let error = $state('');
	let loading = $state(false);

	async function runQuery(event: Event): Promise<void> {
		event.preventDefault();
		error = '';
		responseJson = '';
		loading = true;

		try {
			const variables = parseVariables();
			const data = await api.v4uncached(query, {variables});
			responseJson = JSON.stringify(data, undefined, 2);
		} catch (caughtError) {
			error = caughtError instanceof Error
				? caughtError.message
				: String(caughtError);
		} finally {
			loading = false;
		}
	}

	function parseVariables(): Record<string, unknown> | undefined {
		const trimmed = variablesJson.trim();
		if (!trimmed) {
			return undefined;
		}

		const parsed = JSON.parse(trimmed) as unknown;
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
			throw new TypeError('Variables must be a JSON object.');
		}

		return parsed as Record<string, unknown>;
	}
</script>

<main>
	<rgh-header title="GraphQL tester">
		<p>Run GraphQL queries through Refined GitHub’s authenticated API
			manager.</p>
	</rgh-header>

	<form onsubmit={runQuery}>
		<label for="query">Query</label>
		<textarea
			id="query"
			rows="6"
			spellcheck="false"
			autocomplete="off"
			autocapitalize="off"
			bind:value={query}
		></textarea>

		<label for="variables">Variables (JSON, optional)</label>
		<textarea
			id="variables"
			rows="3"
			spellcheck="false"
			autocomplete="off"
			autocapitalize="off"
			placeholder={JSON.stringify({owner: 'refined-github', name: 'refined-github'})}
			bind:value={variablesJson}
		></textarea>

		<button disabled={loading}>{loading ? 'Running…' : 'Run query'}</button>

		<label for="response">Response</label>
		<textarea
			id="response"
			rows="8"
			readonly
			spellcheck="false"
			value={responseJson}
		></textarea>

		{#if error}
			<p class="error" role="alert">{error}</p>
		{/if}
	</form>
</main>

<style>
	textarea {
		field-sizing: content;
	}
</style>
