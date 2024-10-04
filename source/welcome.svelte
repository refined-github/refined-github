<svelte:options customElement='rgh-welcome' />

<script lang='ts'>
	import './welcome.css';
	import {onMount} from 'svelte';
	import OptionsSync from 'webext-options-sync';

	import {baseApiFetch} from './github-helpers/github-token.js';

	let stepVisible = 1; // 0 = none, 1 = step 1, 2 = step 2, 3 = step 3
	let stepValid = 0; // 0 = none, 1 = step 1, 2 = step 2, 3 = step 3
	let form: HTMLFormElement;
	let tokenInput: string = '';
	let tokenError: string = '';

	$: if (stepValid === 1) {
		setTimeout(showThirdStep, 2000);
	}

	$: if (stepValid === 3) {
		setTimeout(() => {
			location.href = 'https://github.com/refined-github/refined-github/wiki';
		}, 2000);
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
			stepVisible = 2;
		}, 1000);
	}

	async function verifyToken() {
		const isValid = await baseApiFetch({apiBase: 'https://api.github.com/', token: tokenInput, path: '/'});
		if (isValid) {
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

		await new OptionsSync().syncForm(form);
	});
</script>

<link rel='stylesheet' href='welcome.css'>
<main>
	<form bind:this={form} class:dimmed={stepValid === 3}>
		<h1>Welcome to Refined GitHub <img src='icon.png' alt="" height='32' style='vertical-align: baseline;'></h1>
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
					target='_blank'
					rel='noopener noreferrer'
					on:click={markSecondStep}
					id='personal-token-link'
				>
					Generate a token
				</a>
				to ensure that every feature works correctly.
				<a
					href='https://github.com/refined-github/refined-github/wiki/Security'
					target='_blank'
					rel='noopener noreferrer'
				>
					More info
				</a>
			</li>

			<li class:valid={stepValid >= 3} class:visible={stepVisible >= 3} class='will-show'>
				<label for='token-input'>Paste token:</label>
				<input
					id='token-input'
					type='password'
					name='personalToken'
					bind:value={tokenInput}
					on:input={verifyToken}
				/>
				{#if tokenError}
					<span class='error'>{tokenError}</span>
				{/if}
			</li>
		</ul>
	</form>

	<h1 class:visible={stepValid === 3} class='will-show'>
		Setup complete, redirecting to
		<a class='hidden-link' href='https://github.com/refined-github/refined-github/wiki'>wiki</a>…
	</h1>
</main>
