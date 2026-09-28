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
		claimTokenInputSlot,
		tokenInputVisibility,
	} from './token-input-visibility.svelte.js';
	import {
		checkToken,
		getApiUrl,
		type TokenValidation,
	} from './validate-token.js';

	const {host}: {host?: string} = $props();
	const slotIndex = claimTokenInputSlot();

	const initialMagicValue = ' '; // Initial non-empty value to avoid validation on first run
	let tokenField: HTMLInputElement;
	let tokenValue = $state(initialMagicValue);
	const isEmpty = $derived(tokenValue.trim() === '');
	const shown = $derived(
		!isEmpty || slotIndex <= tokenInputVisibility.revealed,
	);

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
			throw error.message === 'Token expired'
				? error
				: new Error(`${error.message} (expired?)`, {cause: error});
		}
	}

	const tokenPromise = $derived(validateToken(tokenValue));
	$effect(() => {
		if (
			tokenValue !== initialMagicValue
			&& !isEmpty
			&& tokenInputVisibility.revealed < slotIndex + 1
		) {
			tokenInputVisibility.revealed = slotIndex;
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

<div hidden={!shown}>
	<p>
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
		{#if tokenInputVisibility.revealed > 0}
			<span>
				{#await tokenPromise}
					{@render compactScopesList()}
				{:then result}
					{@render compactScopesList(result?.scopes)}
				{:catch}
					{@render compactScopesList()}
				{/await}
			</span>
		{/if}
		{#await tokenPromise}
			<span>Validating…</span>
		{:then result}
			<span>
				{result?.message ?? ''}
			</span>
		{:catch error}
			<span>
				{@render validationIcon('invalid')}
				{error.message}
			</span>
		{/await}
		{#if tokenInputVisibility.revealed === slotIndex
	&& tokenInputVisibility.revealed < 2}
			<button
				type="button"
				onclick={() => tokenInputVisibility.revealed++}
			>
				+ add user
			</button>
		{/if}
	</p>

	{#if tokenInputVisibility.revealed === 0}
		<ul>
			{#await tokenPromise}
				{@render scopesList()}
			{:then result}
				{@render scopesList(result?.scopes)}
			{:catch}
				{@render scopesList()}
			{/await}
		</ul>
	{:else if tokenInputVisibility.revealed === slotIndex}
		<ul>
			{@render scopesList()}
		</ul>
	{/if}
</div>

<style>
	.compact-scopes {
		display: inline-flex;
		gap: 0.2em;
		align-items: center;
	}
</style>
