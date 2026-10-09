<script lang="ts">
	import {closestElement} from 'select-dom';
	import {assertError} from 'ts-extras';

	import DomChef from '../components/dom-chef.svelte';
	import {getFeatureUrl} from '../helpers/rgh-links.js';
	import {
		apiFeaturesUrl,
		defaultIcon,
		getScopeState,
		SCOPE_ICON,
		type ScopeState,
		STANDARD_SCOPES,
	} from './token-input-scopes.js';
	import {
		checkToken,
		getApiUrl,
		TokenExpiredError,
		type TokenValidation,
	} from './validate-token.js';

	const {host, index, revealed, last, reveal}: {
		host?: string;
		index: number;
		revealed: number; // Highest visible index
		last: boolean;
		reveal: (_index: number) => void;
	} = $props();

	const initialMagicValue = ' '; // Initial non-empty value to avoid validation on first run
	let tokenField: HTMLInputElement;
	let tokenValue = $state(initialMagicValue);
	const isEmpty = $derived(tokenValue.trim() === '');
	const shown = $derived(!isEmpty || index <= revealed);
	const active = $derived(revealed === index);
	const compact = $derived(revealed > 0);

	function expandTokenSection(): void {
		closestElement('details', tokenField).open = true;
	}

	async function validateToken(
		value: string,
	): Promise<TokenValidation | undefined> {
		// Silence first run
		if (value === initialMagicValue) {
			return;
		}

		if (value === '') {
			// Only expand if it's the first field
			if (shown) {
				expandTokenSection();
			}

			// Exit validation, never attempt for ''
			return;
		}

		try {
			return await checkToken(getApiUrl(host), value);
		} catch (error) {
			assertError(error);
			expandTokenSection();
			throw error instanceof TokenExpiredError
				? error
				: new Error(`${error.message} (expired?)`, {cause: error});
		}
	}

	const tokenPromise = $derived(validateToken(tokenValue));
	const settled = $derived(tokenPromise.catch(() => undefined));
	$effect(() => {
		if (!isEmpty) {
			reveal(index);
		}
	});
</script>

{#snippet validationIcon(state?: ScopeState, title?: string)}
	{@const {Icon, color} = state ? SCOPE_ICON[state] : defaultIcon}
	<span {title}>
		<DomChef as={Icon} style={{color}} />
	</span>
{/snippet}

{#snippet scopesList(scopes?: string[])}
	{#each STANDARD_SCOPES as scope (scope)}
		<li>
			{@render validationIcon(getScopeState(scope, scopes))}
			{#if scope === 'valid_token'}
				The token enables <a href={apiFeaturesUrl}>some features</a>
				to <strong>read</strong> data from public repositories
			{:else if scope === 'public_repo'}
				The <code>public_repo</code> scope lets them <strong>edit</strong> your
				public repositories
			{:else if scope === 'repo'}
				The <code>repo</code> scope lets them <strong>edit private</strong>
				repositories as well
			{:else if scope === 'read:project'}
				The <code>read:project</code> scope lets them determine if a repo/org
				uses projects
			{:else if scope === 'workflow'}
				The <code>workflow</code> scope lets them
				<strong>edit workflow files</strong>
				<code>.github/workflows/*.yml</code>
			{/if}
		</li>
	{/each}
	{#if scopes?.includes('delete_repo')}
		<li>
			{@render validationIcon('valid')}
			The <code>delete_repo</code> scope enables <a
				href={getFeatureUrl('quick-repo-deletion' as string & {feature: true})}
			>quick-repo-deletion</a>
		</li>
	{/if}
{/snippet}

{#snippet compactScopesList(scopes?: string[])}
	<span class="compact-scopes" aria-label="Token scopes">
		{#each STANDARD_SCOPES as scope (scope)}
			{@render validationIcon(getScopeState(scope, scopes), scope)}
		{/each}
		{#if scopes?.includes('delete_repo')}
			{@render validationIcon('valid', 'delete_repo')}
		{/if}
	</span>
{/snippet}

<fieldset hidden={!shown}>
	{#await settled then result}
		<input type="hidden" name="username" value={result?.user} />
	{/await}
	<input
		bind:this={tokenField}
		bind:value={tokenValue}
		type="text"
		name="personalToken[]"
		spellcheck="false"
		autocomplete="off"
		autocapitalize="off"
		size="20"
		class="monospace-field token-field"
	/>
	{#if compact}
		{#await settled}
			{@render compactScopesList()}
		{:then result}
			{@render compactScopesList(result?.scopes)}
		{/await}
	{/if}
	{#await tokenPromise}
		<span>Validating…</span>
	{:then result}
		<span>
			{result?.message ?? ''}
		</span>
		{#if active && !last && result}
			<button type="button" onclick={() => reveal(index + 1)}>
				+ add user
			</button>
		{/if}
	{:catch error}
		<span>
			{@render validationIcon('invalid')}
			{error.message}
		</span>
	{/await}
</fieldset>

{#if active}
	<ul>
		{#await settled}
			{@render scopesList()}
		{:then result}
			{@render scopesList(compact ? undefined : result?.scopes)}
		{/await}
	</ul>
{/if}

<style>
	fieldset {
		margin: 0;
		padding: 0;
		border: none;
		margin-bottom: 1em;
	}

	code {
		padding: 0.15em 0.2em;
		border-radius: 0.375em;
		background: color-mix(in srgb, currentColor 8%, transparent);
		font-size: 0.8em;
	}

	.token-field:not(:focus) {
		-webkit-text-security: circle;
	}

	.compact-scopes {
		display: inline-flex;
		gap: 0.2em;
		align-items: center;
	}
</style>
