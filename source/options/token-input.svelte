<svelte:options
	customElement={{
		tag: 'token-input',
		shadow: 'none',
		props: {
			host: {type: 'String'},
		},
	}}
/>

<script lang="ts">
	import {closestElement} from 'select-dom';
	import {assertError} from 'ts-extras';

	import {SvelteMap} from 'svelte/reactivity';

	import {getTokenInfo, tokenUser} from '../github-helpers/github-token.js';

	const {host}: {host?: string} = $props();

	let focused = $state(false);

	let tokenField: HTMLInputElement;
	let tokenValue = $state('');
	let validationText = $state('');
	let validationError = $state(false);
	let scopes = $state<string[]>(['unknown']);

	const scopeElements = [
		'valid_token',
		'public_repo',
		'repo',
		'read:project',
		'workflow',
	];

	const scopeStates = $derived.by(() => {
		const map = new SvelteMap<string, 'valid' | 'invalid' | ''>();
		for (const scope of scopeElements) {
			map.set(
				scope,
				scopes.includes(scope)
					? 'valid'
					: scopes.includes('unknown')
					? ''
					: 'invalid',
			);
		}

		return map;
	});

	function getApiUrl(): string {
		return !host || host === 'github.com'
			? 'https://api.github.com/'
			: `https://${host}/api/v3/`;
	}

	function expandTokenSection(): void {
		closestElement('details', tokenField).open = true;
	}

	async function validateToken(value: string): Promise<void> {
		validationText = '';
		validationError = false;
		scopes = ['unknown'];

		if (!tokenField?.validity.valid || value.length === 0) {
			// The Chrome options iframe auto-sizer causes the "scrollIntoView" function to scroll incorrectly unless you wait a bit
			// https://github.com/refined-github/refined-github/issues/6807
			setTimeout(expandTokenSection, 100);
			return;
		}

		validationText = 'Validating…';

		try {
			const base = getApiUrl();
			const [tokenInfo, user] = await Promise.all([
				getTokenInfo(base, value),
				tokenUser.get(base, value),
			]);

			if (
				tokenInfo.expiration
				&& new Date(tokenInfo.expiration).getTime() < Date.now()
			) {
				validationText = 'Token expired';
				validationError = true;
				expandTokenSection();
				return;
			}

			validationText = `👤 @${user}`;
			scopes = tokenInfo.scopes;
		} catch (error) {
			assertError(error);
			validationText = error.message + ' (expired?)';
			validationError = true;
			expandTokenSection();
			throw error;
		}
	}

	$effect(() => {
		validateToken(tokenValue);
	});
</script>

<p>
	<input
		bind:this={tokenField}
		bind:value={tokenValue}
		type={focused ? 'text' : 'password'}
		name="personalToken"
		spellcheck="false"
		autocomplete="off"
		autocapitalize="off"
		size="20"
		class="monospace-field"
		onfocus={() => {
			focused = true;
		}}
		onblur={() => {
			focused = false;
		}}
	/>
	<output data-validation={validationError ? 'invalid' : undefined}>
		{validationText}
	</output>
</p>
<ul>
	<token-scope name="valid_token" state={scopeStates.get('valid_token')}>
		The token enables <a
			href="https://github.com/search?q=repo%3Arefined-github%2Frefined-github+%28api.js+OR+does-file-exist.js+OR+get-default-branch.js+OR+get-pr-info.js+OR+pr-ci-status.js%29+path%3A%2F%5Esource%5C%2Ffeatures%5C%2F%2F&type=code"
		>
			some features
		</a>
		to <strong>read</strong> data from public repositories
	</token-scope>
	<token-scope name="public_repo" state={scopeStates.get('public_repo')}>
		The <code>public_repo</code> scope lets them <strong>edit</strong> your
		public repositories
	</token-scope>
	<token-scope name="repo" state={scopeStates.get('repo')}>
		The <code>repo</code> scope lets them <strong>edit private</strong>
		repositories as well
	</token-scope>
	<token-scope name="read:project" state={scopeStates.get('read:project')}>
		The <code>read:project</code> scope lets them determine if a repo/org uses
		projects
	</token-scope>
	<token-scope name="workflow" state={scopeStates.get('workflow')}>
		The <code>workflow</code> scope lets them
		<strong>edit workflow files</strong>
		<code>.github/workflows/*.yml</code>
	</token-scope>
</ul>
<style>
	/* Improve wrapping https://github.com/refined-github/refined-github/issues/9153 */
	output {
		display: inline-block;
	}
</style>
