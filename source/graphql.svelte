<svelte:options customElement="rgh-graphql" />

<script lang="ts">
	import type {JsonObject} from 'type-fest';

	import api from './github-helpers/api.js';
	import Header from './options/header.svelte';

	let query = $state(`viewer {
	login
}`);
	let variablesJson = $state(
		JSON.stringify(
			{owner: 'refined-github', name: 'refined-github'},
			undefined,
			'\t',
		),
	);
	let responseJson = $state('');
	let error = $state('');
	let loading = $state(false);
	let form: HTMLFormElement | undefined;

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

	function parseVariablesJson(rawJson: string): JsonObject | undefined {
		const trimmed = rawJson.trim();
		if (!trimmed) {
			return undefined;
		}

		const parsed = JSON.parse(trimmed) as unknown;
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
			throw new TypeError('Variables must be a JSON object.');
		}

		return parsed as JsonObject;
	}

	function parseVariables(): JsonObject | undefined {
		return parseVariablesJson(variablesJson);
	}

	function validateVariablesField(event: Event): void {
		const textarea = event.currentTarget as HTMLTextAreaElement;

		try {
			parseVariablesJson(textarea.value);
			textarea.setCustomValidity('');
		} catch (error) {
			textarea.setCustomValidity(error instanceof Error ? error.message : String(error));
		}
	}

	function formatVariablesField(event: FocusEvent): void {
		const textarea = event.currentTarget as HTMLTextAreaElement;

		try {
			const parsed = parseVariablesJson(textarea.value);
			textarea.setCustomValidity('');
			variablesJson = parsed
				? JSON.stringify(parsed, undefined, '\t')
				: '';
		} catch {}
	}

	function submitOnShortcut(event: KeyboardEvent): void {
		if (
			loading || event.isComposing
			|| event.key !== 'Enter' || !(event.metaKey || event.ctrlKey)
		) {
			return;
		}

		form?.requestSubmit();
		event.preventDefault();
	}
</script>

<main>
	<Header title="GraphQL tester"></Header>

	<form bind:this={form} onsubmit={runQuery}>
		<label for="query">Query</label>
		<textarea
			id="query"
			spellcheck="false"
			autocomplete="off"
			autocapitalize="off"
			bind:value={query}
			onkeydown={submitOnShortcut}
		></textarea>

		<label for="variables">Variables (JSON, optional)</label>
		<textarea
			id="variables"
			spellcheck="false"
			autocomplete="off"
			autocapitalize="off"
			bind:value={variablesJson}
			oninput={validateVariablesField}
			onblur={formatVariablesField}
			onkeydown={submitOnShortcut}
		></textarea>

		<button disabled={loading}>{loading ? 'Running…' : 'Run query'}</button>

		<label for="response">Response</label>
		<textarea
			id="response"
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
	:host {
		font-size: 2em;
		display: block;
	}

	main {
		--content-width: 60rem;
		--viewport-margin: 30px;
	}

	form {
		display: grid;
		gap: 1em;
		padding-inline: var(--viewport-margin);
		padding-block: 1.5rem;
		max-width: var(--content-width);
		margin: auto;
	}

	label {
		font-weight: 600;
	}

	textarea {
		field-sizing: content;
		min-height: 3em;
		font-family:
			ui-monospace,
			SFMono-Regular,
			Menlo,
			Monaco,
			Consolas,
			monospace;
		background: light-dark(#f6f8fa, #151b23);
		border: solid 1px light-dark(#d0d9e0, #3d444d);
		border-radius: 6px;
		padding: 10px 12px;
		font-size: 0.8em;
		line-height: 1.4;
	}

	textarea:focus {
		background: light-dark(#fff, #0d1117);
		border-color: #1f6feb;
		box-shadow: inset 0 0 0 1px #1f6feb;
		outline: none;
	}

	#variables:invalid {
		border-color: light-dark(#cf222e, #f85149);
	}

	#variables:invalid:focus {
		box-shadow: inset 0 0 0 1px light-dark(#cf222e, #f85149);
	}

	button {
		justify-self: start;
		font-size: 0.9em;
		padding: 0.45em 0.9em;
	}

	.error {
		color: #cf222e;
		margin: 0;
	}
</style>
