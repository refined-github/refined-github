<svelte:options customElement='rgh-welcome' />

<script lang='ts'>
	import './welcome.css';
	import {onMount} from 'svelte';

	import './helpers/target-blank-polyfill.js';
	import optionsStorage from './options-storage.js';
	import {hasValidGitHubComToken} from './github-helpers/github-token.js';

	let stepVisible = 1;
	let stepValid = 0;
	let tokenInput = '';
	let tokenError = '';

	$: if (stepValid === 1) {
		setTimeout(showThirdStep, 2000);
	}

	$: if (stepValid === 3) {
		setTimeout(() => {
			location.href = 'https://github.com/refined-github/refined-github/wiki';
		}, 2000);
	}

	$: if (tokenInput) {
		verifyToken();

		// @ts-expect-error TS and its index signatures...
		optionsStorage.set({personalToken: tokenInput});
	}

	const origins = ['https://github.com/*', 'https://gist.github.com/*'];

	async function grantPermissions() {
		const granted = await chrome.permissions.request({origins});
		if (granted) {
			stepVisible = 2;
			stepValid = 1;
		}
	}

	function showThirdStep() {
		stepVisible = 3;
	}

	function markSecondStep() {
		setTimeout(() => {
			stepValid = 2;
			stepVisible = 3;
		}, 1000);
	}

	async function verifyToken() {
		try {
			await hasValidGitHubComToken(tokenInput);
			stepValid = 3;
			tokenError = '';
		} catch {
			tokenError = 'Invalid token';
		}
	}

	onMount(async () => {
		if (await chrome.permissions.contains({origins})) {
			stepValid = 1;
			setTimeout(() => {
				stepVisible = 2;
			}, 500);
		}
	});
</script>

<link rel='stylesheet' href='welcome.css'>
<main class:dimmed={stepValid === 3}>
	<header>
		<h1>
			<img src='icon.png' alt="" height='32'>
			Welcome to Refined GitHub
		</h1>
	</header>
	<ul>
		<li class:valid={stepValid >= 1} class:visible={stepVisible >= 1} class='will-show'>
			{#if stepValid === 0}
				<button on:click={grantPermissions}>
					Grant
				</button>
			{:else}
				Grant
			{/if}
			the extension access to github.com
		</li>

		<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<li class:valid={stepValid >= 2} class:visible={stepVisible >= 2} class='will-show' on:click={showThirdStep}>
			<a
				href='https://github.com/settings/tokens/new?description=Refined%20GitHub&scopes=repo,read:project'
				on:click={markSecondStep}
			>
				Generate a token
			</a>
			to ensure that every feature works correctly.
			<a
				href='https://github.com/refined-github/refined-github/wiki/Security'
			>
				More info
			</a>
		</li>

		<li class:valid={stepValid >= 3} class:visible={stepVisible >= 3} class='will-show'>
			<label for='token-input'>Paste token:</label>
			<input
				id='token-input'
				type='text'
				size='10'
				autocomplete='current-password'
				name='personalToken'
				bind:value={tokenInput}
			/>
			{#if tokenError}
				<span class='error'>{tokenError}</span>
			{/if}
		</li>
	</ul>

	<footer>
		<h1 class:visible={stepValid === 3} class='will-show'>
			Setup complete, redirecting to
			<a class='hidden-link' href='https://github.com/refined-github/refined-github/wiki' target='_self'>GitHub</a>…
		</h1>
	</footer>
</main>
