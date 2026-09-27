<script lang="ts">
	import CheckCircleFillIcon from 'octicons-plain-react/CheckCircleFill';
	import CircleSlashIcon from 'octicons-plain-react/CircleSlash';
	import DotIcon from 'octicons-plain-react/Dot';
	import {closestElement} from 'select-dom';
	import {assertError} from 'ts-extras';

	import DomChef from '../components/dom-chef.svelte';
	import {getTokenInfo, tokenUser} from '../github-helpers/github-token.js';
	import {getFeatureUrl} from '../helpers/rgh-links.js';
	import {
		claimTokenInputSlot,
		tokenInputVisibility,
	} from './token-input-visibility.svelte.js';

	const {host}: {host?: string} = $props();
	const slotIndex = claimTokenInputSlot();

	const rtf = new Intl.RelativeTimeFormat('en', {numeric: 'auto'});
	const apiFeaturesUrl =
		'https://github.com/search?q=repo%3Arefined-github%2Frefined-github+%28api.js+OR+does-file-exist.js+OR+get-default-branch.js+OR+get-pr-info.js+OR+pr-ci-status.js%29+path%3A%2F%5Esource%5C%2Ffeatures%5C%2F%2F&type=code';

	const initialMagicValue = ' '; // Initial non-empty value to avoid validation on first run
	let tokenField: HTMLInputElement;
	let tokenValue = $state(initialMagicValue);
	const isEmpty = $derived(tokenValue.trim() === '');
	const shown = $derived(
		!isEmpty || slotIndex <= tokenInputVisibility.revealed,
	);
	type Validation = {message: string; scopes?: string[]};

	function getApiUrl(): string {
		return !host || host === 'github.com'
			? 'https://api.github.com/'
			: `https://${host}/api/v3/`;
	}

	function expandTokenSection(): void {
		closestElement('details', tokenField).open = true;
	}

	function getScopeState(
		scope: string,
		scopes?: string[],
	): 'valid' | 'invalid' | undefined {
		return scopes?.includes(scope)
			? 'valid'
			: scopes
			? 'invalid'
			: undefined;
	}

	async function validateToken(value: string): Promise<Validation | undefined> {
		// Silence first run
		if (value === initialMagicValue) {
			return;
		}

		if (value === '') {
			if (shown) {
				// Only expand if it's the first field
				expandTokenSection();
			}

			// Exit validation, never attempt for ''
			return;
		}

		try {
			if (value.length < 40) {
				throw new Error('Token is too short');
			}

			const base = getApiUrl();
			const [tokenInfo, user] = await Promise.all([
				getTokenInfo(base, value),
				tokenUser.get(base, value),
			]);

			if (
				tokenInfo.expiration
				&& new Date(tokenInfo.expiration).getTime() < Date.now()
			) {
				expandTokenSection();
				throw new Error('Token expired');
			}

			// Build status message with user and expiration
			let message = `👤 @${user}`;
			if (tokenInfo.expiration) {
				const msUntilExpiration = new Date(tokenInfo.expiration).getTime()
					- Date.now();
				const daysUntilExpiration = Math.ceil(
					msUntilExpiration / (1000 * 60 * 60 * 24),
				);
				message += `, expires ${rtf.format(daysUntilExpiration, 'day')}`;
			}

			return {message, scopes: tokenInfo.scopes};
		} catch (error) {
			assertError(error);
			expandTokenSection();
			throw new Error(`${error.message} (expired?)`, {cause: error});
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

{#snippet validationIcon(state?: 'valid' | 'invalid', title?: string)}
	<DomChef
		as={state === 'valid'
		? CheckCircleFillIcon
		: state === 'invalid'
		? CircleSlashIcon
		: DotIcon}
		title={title}
		style={{
			color: `var(--rgh-${
				state === 'valid'
					? 'green'
					: state === 'invalid'
					? 'red'
					: 'inherit'
			})`,
		}}
	/>
{/snippet}

{#snippet scopesList(scopes?: string[])}
	<li>
		{@render validationIcon(getScopeState('valid_token', scopes))}
		The token enables <a href={apiFeaturesUrl}>some features</a>
		to <strong>read</strong> data from public repositories
	</li>
	<li>
		{@render validationIcon(getScopeState('public_repo', scopes))}
		The <code>public_repo</code> scope lets them <strong>edit</strong> your
		public repositories
	</li>
	<li>
		{@render validationIcon(getScopeState('repo', scopes))}
		The <code>repo</code> scope lets them <strong>edit private</strong>
		repositories as well
	</li>
	<li>
		{@render validationIcon(getScopeState('read:project', scopes))}
		The <code>read:project</code> scope lets them determine if a repo/org uses
		projects
	</li>
	<li>
		{@render validationIcon(getScopeState('workflow', scopes))}
		The <code>workflow</code> scope lets them
		<strong>edit workflow files</strong>
		<code>.github/workflows/*.yml</code>
	</li>
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
		{@render validationIcon(
			getScopeState('valid_token', scopes),
			'valid_token',
		)}
		{@render validationIcon(
			getScopeState('public_repo', scopes),
			'public_repo',
		)}
		{@render validationIcon(getScopeState('repo', scopes), 'repo')}
		{@render validationIcon(
			getScopeState('read:project', scopes),
			'read:project',
		)}
		{@render validationIcon(getScopeState('workflow', scopes), 'workflow')}
		{#if scopes?.includes('delete_repo')}
			{@render validationIcon('valid', 'delete_repo')}
		{/if}
	</span>
{/snippet}

<p hidden={!shown}>
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
	<ul hidden={!shown}>
		{#await tokenPromise}
			{@render scopesList()}
		{:then result}
			{@render scopesList(result?.scopes)}
		{:catch}
			{@render scopesList()}
		{/await}
	</ul>
{:else if tokenInputVisibility.revealed === slotIndex}
	<ul hidden={!shown}>
		{@render scopesList()}
	</ul>
{/if}

<style>
	.token-field:not(:focus) {
		-webkit-text-security: circle;
	}

	.compact-scopes {
		display: inline-flex;
		gap: 0.2em;
		align-items: center;
	}
</style>
