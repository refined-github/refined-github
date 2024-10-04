<svelte:options customElement='rgh-welcome' />

<script lang='ts'>
	import {onMount} from 'svelte';
	import 'webext-base-css/webext-base.css';
	import OptionsSync from 'webext-options-sync';

	let step1Valid = false;
	let step2Valid = false;
	let step3Valid = false;
	let step2Visible = false;
	let step3Visible = false;
	let form: HTMLFormElement;

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

<main>
	<h1>Welcome to Refined GitHub ✨</h1>

	<form bind:this={form}>
		<ul>
			<li class:valid={step1Valid} class:visible={true}>
				{#if step1Valid}
					Grant
				{:else}
					<button on:click={grantPermissions}>
						Grant
					</button>
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
					type='text'
					name='personalToken'
				/>
			</li>
		</ul>
	</form>
</main>

<style>
  :host {
    font-size: 2em;
    display: grid;
    place-items: center;
    min-height: 100vh;
  }

  h1 {
    font-size: 1.5em;
    font-weight: 200;
  }

  ul {
    padding-left: 0;
    list-style: none;
  }

  a,
  button {
    all: initial;
    font: inherit;
    text-decoration: underline;
    color: cornflowerblue;
    cursor: pointer;
  }

  input {
	font-size: inherit
  }

  li {
    margin-block: 1em;
    animation: fade-in 0.5s;
    animation-play-state: paused;
  }

  li.visible {
    animation-play-state: running;
  }

  li::before {
    content: '';
    display: inline-block;
    width: 1em;
    height: 1em;
    vertical-align: -0.2em;
    margin-right: 0.3em;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill-rule="evenodd" fill="gray" d="M8 5.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM4 8a4 4 0 118 0 4 4 0 01-8 0z"></path></svg>');
    background-size: contain;
  }

  li.valid::before {
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill-rule="evenodd" fill="%2328a745" d="M8 16A8 8 0 108 0a8 8 0 000 16zm3.78-9.72a.75.75 0 00-1.06-1.06L6.75 9.19 5.28 7.72a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l4.5-4.5z"></path></svg>');
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
  }
</style>