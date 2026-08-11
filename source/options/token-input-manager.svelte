<script lang="ts">
	import {
		getTokenOptionName,
		getTokenOptions,
		getTokenOptionUsername,
		isTokenOptionName,
	} from '../github-helpers/token-options.js';
	import {perDomainOptions} from '../options-storage.js';

	import TokenInput from './token-input.svelte';

	type TokenEntry = {
		id: number;
		domain: string;
		name: string;
		token: string;
	};

	const {domain = 'default'}: {domain?: string} = $props();

	let entries = $state<TokenEntry[]>([]);
	let ready = $state(false);
	let loadId = 0;
	let nextEntryId = 0;

	const host = $derived(domain === 'default' ? 'github.com' : domain);

	function createEntry(
		selectedDomain: string,
		name = '',
		token = '',
	): TokenEntry {
		return {
			id: nextEntryId++,
			domain: selectedDomain,
			name,
			token,
		};
	}

	async function getStorageForDomain(selectedDomain: string) {
		const origins = await perDomainOptions.getAllOrigins();
		const storage = origins.get(selectedDomain);
		if (!storage) {
			throw new Error(`Options storage not found for ${selectedDomain}`);
		}

		return storage;
	}

	async function loadTokens(selectedDomain: string): Promise<void> {
		const currentLoadId = ++loadId;
		ready = false;

		const storage = await getStorageForDomain(selectedDomain);
		const options = await storage.getAll();
		if (currentLoadId !== loadId) {
			return;
		}

		const loadedEntries = getTokenOptions(options)
			.map(([name, token]) => createEntry(selectedDomain, name, token));
		if (options.personalToken) {
			loadedEntries.unshift(
				createEntry(selectedDomain, 'personalToken', options.personalToken),
			);
		}

		entries = loadedEntries.length > 0
			? loadedEntries
			: [createEntry(selectedDomain)];
		ready = true;
	}

	async function saveValidatedToken(
		entry: TokenEntry,
		username: string,
		token: string,
	): Promise<void> {
		if (entry.domain !== domain || !entries.includes(entry)) {
			return;
		}

		const previousName = entry.name;
		const name = getTokenOptionName(username);
		const duplicate = entries.find(
			item => item !== entry && item.name.toLowerCase() === name.toLowerCase(),
		);

		if (duplicate) {
			duplicate.token = token;
			entries = entries.filter(item => item !== entry);
		} else {
			entry.name = name;
		}

		const storage = await getStorageForDomain(entry.domain);
		const options = await storage.getAll();
		if (previousName && previousName !== name) {
			Reflect.deleteProperty(options, previousName);
		}

		options[name] = token;
		await storage.setAll(options);
	}

	async function removeStoredToken(entry: TokenEntry): Promise<void> {
		const {name} = entry;
		entry.name = '';
		if (!name) {
			return;
		}

		const storage = await getStorageForDomain(entry.domain);
		const options = await storage.getAll();
		Reflect.deleteProperty(options, name);
		await storage.setAll(options);
	}

	async function removeEntry(entry: TokenEntry): Promise<void> {
		entries = entries.filter(item => item !== entry);
		await removeStoredToken(entry);

		if (entries.length === 0) {
			entries = [createEntry(domain)];
		}
	}

	function addEntry(): void {
		entries.push(createEntry(domain));
	}

	function getEntryUsername(entry: TokenEntry): string | undefined {
		return isTokenOptionName(entry.name)
			? getTokenOptionUsername(entry.name)
			: undefined;
	}

	$effect(() => {
		loadTokens(domain);
	});
</script>

<div data-token-input-manager data-ready={ready}>
	{#if ready}
		{#each entries as entry, index (entry.id)}
			<div class="token-entry">
				<TokenInput
					{host}
					name={entry.name}
					bind:value={entry.token}
					onEmpty={() => removeStoredToken(entry)}
					onValidated={(username, token) => saveValidatedToken(entry, username, token)}
				>
					{#snippet actions()}
						{#if index === 0 && entry.name}
							<button type="button" onclick={addEntry}>
								+ {entries.length === 1 ? 'multiple users' : 'add user'}
							</button>
						{:else if index > 0}
							<button type="button" onclick={() => removeEntry(entry)}>
								- remove {
									getEntryUsername(entry)
									? `@${getEntryUsername(entry)}`
									: 'user'
								}
							</button>
						{/if}
					{/snippet}
				</TokenInput>
			</div>
		{/each}
	{/if}
</div>

<style>
	.token-entry + .token-entry {
		margin-top: 1.5em;
	}
</style>
