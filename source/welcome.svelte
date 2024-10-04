<svelte:options customElement='rgh-welcome' />

<script lang='ts'>
	import './welcome.css';

	import {onMount} from 'svelte';
	import OptionsSync from 'webext-options-sync';

	let step1Valid = false;
	let step2Valid = false;
	let step3Valid = false;
	let step2Visible = false;
	let step3Visible = false;
	let form: HTMLFormElement;
	let tokenInput: string = '';
	let tokenError: string = '';

	const origins = ['https://github.com/*', 'https://gist.github.com/*'];

	async function grantPermissions() {
		const granted = await chrome.permissions.request({origins});
		if (granted) {
			step1Valid = true;
			step2Visible = true;
		}
	}

	function markSecondStep() {
		setTimeout(() => {
			step2Valid = true;
			step3Visible = true;
		}, 1000);
	}

	onMount(async () => {
		if (await chrome.permissions.contains({origins})) {
			step1Valid = true;
			step2Visible = true;
		}

		await new OptionsSync().syncForm(form);

		setTimeout(() => {
			step3Visible = true;
		}, 4000);
	});
</script>

<link rel='stylesheet' href='welcome.css'>
<main>
	<h1>Welcome to Refined GitHub <img src='icon.png' alt="" height='32' style='vertical-align: baseline;'></h1>

	<form bind:this={form}>
		<ul>
			<li class:valid={currentStep > 1} class:visible={currentStep >= 1} class='hidden'>
				{#if currentStep === 1}
					<button on:click={grantPermissions}>
						Grant
					</button>
				{:else}
					Grant
				{/if}
				the extension access to github.com
			</li>

			<li class:valid={step2Valid} class:visible={step2Visible}>
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

			<li class:valid={step3Valid} class:visible={step3Visible}>
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

	<h2 class:visible={currentStep === 4} class='hidden'>
		Setup complete,
		<a href='https://github.com/refined-github/refined-github/wiki'>return to GitHub</a> 🎈
	</h2>
</main>
