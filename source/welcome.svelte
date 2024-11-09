<svelte:options customElement='rgh-welcome' />

<script lang='ts'>
	import './welcome.css';
	import {onMount} from 'svelte';

	import './helpers/target-blank-polyfill.js';
	import optionsStorage from './options-storage.js';
	import {hasValidGitHubComToken} from './github-helpers/github-token.js';

	let stepVisible = $state(1);
	let stepValid = $state(0);
	let tokenInput = $state('');
	let tokenError = $state('');

	$effect(() => {
		if (stepValid === 1) {
			setTimeout(showThirdStep, 2000);
		} else if (stepValid === 3) {
			setTimeout(() => {
				location.replace('https://github.com/refined-github/refined-github/wiki');
			}, 2000);
		}
	});

	$effect(() => {
		if (tokenInput) {
			verifyToken();

			// @ts-expect-error TS and its index signatures...
			optionsStorage.set({personalToken: tokenInput});
		}
	});

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
		if (await hasValidGitHubComToken(tokenInput)) {
			stepValid = 3;
			tokenError = '';
		} else {
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
	<rgh-header title='Welcome to Refined GitHub'></rgh-header>

	<div class="content">
		<ul>
			<li class:valid={stepValid >= 1} class:visible={stepVisible >= 1} class='will-show'>
				{#if stepValid === 0}
					<button onclick={grantPermissions}>
						Grant
					</button>
				{:else}
					Grant
				{/if}
				the extension access to github.com
			</li>

			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<li class:valid={stepValid >= 2} class:visible={stepVisible >= 2} class='will-show' onclick={showThirdStep}>
				<a
					href='https://github.com/settings/tokens/new?description=Refined%20GitHub&scopes=repo,read:project&default_expires_at=none'
					onclick={markSecondStep}
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
	</div>

	<footer>
		<h2 class:visible={stepValid === 3} class='will-show'>
			Setup complete, redirecting to
			<a class='hidden-link' href='https://github.com/refined-github/refined-github/wiki' target='_self'>GitHub</a>…
		</h2>
	</footer>
</main>
