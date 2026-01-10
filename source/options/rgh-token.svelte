<svelte:options
	customElement={{
		tag: 'rgh-token',
		props: {
			personalTokenLink: {type: 'String', attribute: 'personal-token-link'},
		},
		extend(customElementConstructor) {
			return class extends customElementConstructor {
				static formAssociated = true;
				_internals;

				constructor() {
					super();
					this._internals = this.attachInternals();
				}

				get form() {
					return this._internals.form;
				}

				get name() {
					return this.getAttribute('name');
				}

				get type() {
					return this.localName;
				}

				get validity() {
					const input = this.shadowRoot?.querySelector(
						'input[name="personalToken"]',
					);
					return input?.validity ?? {valid: true};
				}

				get value() {
					const input = this.shadowRoot?.querySelector(
						'input[name="personalToken"]',
					);
					return input?.value ?? '';
				}

				get disabled() {
					const input = this.shadowRoot?.querySelector(
						'input[name="personalToken"]',
					);
					return input?.disabled ?? false;
				}

				get internals() {
					return this._internals;
				}
			};
		},
	}}
/>

<!-- prettier-ignore -->
<script lang="ts">
	import {onMount} from 'svelte';
	import {SvelteMap} from 'svelte/reactivity';
	import {assertError} from 'ts-extras';

	import {getTokenInfo, tokenUser} from '../github-helpers/github-token.js';

	const {personalTokenLink}: {personalTokenLink?: string} = $props();

	let validationText = $state('');
	let validationError = $state(false);
	const scopeStates = new SvelteMap<string, 'valid' | 'invalid' | ''>();

	let tokenField;

	onMount(() => {
		validateToken();
	});

	function reportStatus(
		{error, text, scopes = ['unknown']}: {
			error?: boolean;
			text?: string;
			scopes?: string[];
		} = {},
	): void {
		validationText = text ?? '';
		validationError = error ?? false;

		// Update scope states
		scopeStates.clear();
		const scopeElements = [
			'valid_token',
			'public_repo',
			'repo',
			'read:project',
			'workflow',
		];
		for (const scope of scopeElements) {
			scopeStates.set(
				scope,
				scopes.includes(scope)
					? 'valid'
					: scopes.includes('unknown')
						? ''
						: 'invalid',
			);
		}
	}

	function getApiUrl(): string {
		if (!personalTokenLink) {
			return 'https://api.github.com/';
		}

		try {
			const url = new URL(personalTokenLink);
			return url.host === 'github.com'
				? 'https://api.github.com/'
				: `${url.origin}/api/v3/`;
		} catch {
			return 'https://api.github.com/';
		}
	}

	function expandTokenSection(): void {
		const detailsElement = tokenField?.closest('details');
		if (detailsElement) {
			detailsElement.open = true;
		}
	}

	async function validateToken(): Promise<void> {
		reportStatus();

		if (!tokenField?.validity.valid || tokenField.value.length === 0) {
			// The Chrome options iframe auto-sizer causes the "scrollIntoView" function to scroll incorrectly unless you wait a bit
			// https://github.com/refined-github/refined-github/issues/6807
			setTimeout(expandTokenSection, 100);
			return;
		}

		reportStatus({text: 'Validating…'});

		try {
			const base = getApiUrl();
			const [tokenInfo, user] = await Promise.all([
				getTokenInfo(base, tokenField.value),
				tokenUser.get(base, tokenField.value),
			]);

			// Check if token is expired
			if (tokenInfo.expiration) {
				const msUntilExpiration = new Date(tokenInfo.expiration).getTime() - Date.now();
				if (msUntilExpiration < 0) {
					reportStatus({error: true, text: 'Token expired'});
					expandTokenSection();
					return;
				}
			}

			// Build status message with user
			const statusMessage = `👤 @${user}`;

			reportStatus({
				text: statusMessage,
				scopes: tokenInfo.scopes,
			});
		} catch (error) {
			assertError(error);
			reportStatus({error: true, text: error.message + ' (expired?)'});
			expandTokenSection();
			throw error;
		}
	}

	function handleInput(): void {
		// Sync value with form
		const host = tokenField?.getRootNode()?.host;
		if (host && 'internals' in host) {
			host.internals.setFormValue(tokenField.value);
		}

		validateToken();
	}

	function handleFocus(): void {
		tokenField.type = 'text';
	}

	function handleBlur(): void {
		tokenField.type = 'password';
	}
</script>

<p>
	<input
		bind:this={tokenField}
		type="password"
		name="personalToken"
		spellcheck="false"
		autocomplete="off"
		autocapitalize="off"
		size="20"
		class="monospace-field"
		oninput={handleInput}
		onfocus={handleFocus}
		onblur={handleBlur}
	/>
	<span
		id="validation"
		data-validation={validationError ? 'invalid' : undefined}
	>
		{validationText}
	</span>
</p>
<ul>
	<token-scope name="valid_token" state={scopeStates.get('valid_token')}>
		The token enables <a
			href="https://github.com/search?q=repo%3Arefined-github%2Frefined-github+%28api.js+OR+does-file-exist.js+OR+get-default-branch.js+OR+get-pr-info.js+OR+pr-ci-status.js%29+path%3A%2F%5Esource%5C%2Ffeatures%5C%2F%2F&type=code"
			>some features</a
		>
		to <strong>read</strong> data from public repositories
	</token-scope>
	<token-scope name="public_repo" state={scopeStates.get('public_repo')}>
		The <code>public_repo</code> scope lets them <strong>edit</strong> your public
		repositories
	</token-scope>
	<token-scope name="repo" state={scopeStates.get('repo')}>
		The <code>repo</code> scope lets them <strong>edit private</strong> repositories
		as well
	</token-scope>
	<token-scope name="read:project" state={scopeStates.get('read:project')}>
		The <code>read:project</code> scope lets them determine if a repo/org uses projects
	</token-scope>
	<token-scope name="workflow" state={scopeStates.get('workflow')}>
		The <code>workflow</code> scope lets them
		<strong>edit workflow files</strong>
		<code>.github/workflows/*.yml</code>
	</token-scope>
</ul>

<style>
	.monospace-field {
		/* Same as GitHub style for `code` */
		font-family:
			ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas,
			'Liberation Mono', monospace !important;
	}

	input[name='personalToken']:not(:focus) {
		-webkit-text-security: circle;
	}

	ul {
		padding-left: 0;
		list-style: none;
	}

	p,
	ul {
		margin-top: 0;
	}

	p:last-child,
	ul:last-child {
		margin-bottom: 0;
	}
</style>
