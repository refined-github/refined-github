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
	import {SvelteMap} from 'svelte/reactivity';
	import {assertError} from 'ts-extras';

	import {getTokenInfo, tokenUser} from '../github-helpers/github-token.js';

	const {host}: {host?: string} = $props();

	const rtf = new Intl.RelativeTimeFormat('en', {numeric: 'auto'});
	const apiFeaturesUrl =
		'https://github.com/search?q=repo%3Arefined-github%2Frefined-github+%28api.js+OR+does-file-exist.js+OR+get-default-branch.js+OR+get-pr-info.js+OR+pr-ci-status.js%29+path%3A%2F%5Esource%5C%2Ffeatures%5C%2F%2F&type=code';

	const initialMagicValue = ' '; // Initial non-empty value to avoid validation on first run
	let focused = $state(false);
	let tokenField: HTMLInputElement;
	let tokenValue = $state(initialMagicValue);
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

		// Silence first run
		if (value === initialMagicValue) {
			return;
		}

		if (value === '') {
			expandTokenSection();
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

			// Build status message with user and expiration
			let statusMessage = `👤 @${user}`;
			if (tokenInfo.expiration) {
				const msUntilExpiration = new Date(tokenInfo.expiration).getTime()
					- Date.now();
				const daysUntilExpiration = Math.ceil(
					msUntilExpiration / (1000 * 60 * 60 * 24),
				);
				statusMessage += `, expires ${rtf.format(daysUntilExpiration, 'day')}`;
			} else {
				statusMessage += ', no expiration';
			}

			validationText = statusMessage;
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
	<span data-validation={validationError ? 'invalid' : undefined}>
		{validationText}
	</span>
</p>
<ul>
	<li data-validation={scopeStates.get('valid_token')}>
		The token enables <a href={apiFeaturesUrl}>some features</a>
		to <strong>read</strong> data from public repositories
	</li>
	<li data-validation={scopeStates.get('public_repo')}>
		The <code>public_repo</code> scope lets them <strong>edit</strong> your
		public repositories
	</li>
	<li data-validation={scopeStates.get('repo')}>
		The <code>repo</code> scope lets them <strong>edit private</strong>
		repositories as well
	</li>
	<li data-validation={scopeStates.get('read:project')}>
		The <code>read:project</code> scope lets them determine if a repo/org uses
		projects
	</li>
	<li data-validation={scopeStates.get('workflow')}>
		The <code>workflow</code> scope lets them
		<strong>edit workflow files</strong>
		<code>.github/workflows/*.yml</code>
	</li>
</ul>
<style>
	[data-validation] {
		padding-left: 1.8em;

		/* Improve wrapping https://github.com/refined-github/refined-github/issues/9153 */
		display: inline-block;
	}

	[data-validation]::before {
		content: url('data:image/svg+xml; utf8, <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" fill="gray" d="M8 5.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM4 8a4 4 0 118 0 4 4 0 01-8 0z"></path></svg>');
		width: 16px;
		height: 16px;
		vertical-align: -4px;
		margin-right: 0.4em;
		margin-left: -1.8em; /* Pull out */
		display: inline-block;
	}

	[data-validation='valid']::before {
		content: url('data:image/svg+xml; utf8, <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" fill="%2328a745" d="M8 16A8 8 0 108 0a8 8 0 000 16zm3.78-9.72a.75.75 0 00-1.06-1.06L6.75 9.19 5.28 7.72a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l4.5-4.5z"></path></svg>');
	}

	[data-validation='invalid']::before {
		content: url('data:image/svg+xml; utf8, <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" fill="%23cb2431" d="M1.5 8a6.5 6.5 0 0110.535-5.096l-9.131 9.131A6.472 6.472 0 011.5 8zm2.465 5.096a6.5 6.5 0 009.131-9.131l-9.131 9.131zM8 0a8 8 0 100 16A8 8 0 008 0z"></path></svg>');
	}
</style>
