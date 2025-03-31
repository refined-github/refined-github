<svelte:options customElement="rgh-welcome" />

<!-- prettier-ignore -->
<script lang="ts">
	import {onMount} from 'svelte';
	import 'webext-bugs/target-blank';

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

<main class:dimmed={stepValid === 3}>
	<rgh-header title="Welcome to Refined GitHub"></rgh-header>

	<div class="content">
		<ul>
			<li
				class:valid={stepValid >= 1}
				class:visible={stepVisible >= 1}
				class="will-show"
			>
				{#if stepValid === 0}
					<button onclick={grantPermissions}> Grant </button>
				{:else}
					Grant
				{/if}
				the extension access to github.com
			</li>

			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<li
				class:valid={stepValid >= 2}
				class:visible={stepVisible >= 2}
				class="will-show"
				onclick={showThirdStep}
			>
				<!-- Keep this URL in sync with options.html -->
				<a
					href="https://github.com/settings/tokens/new?description=Refined%20GitHub&scopes=repo,read:project&default_expires_at=none"
					onclick={markSecondStep}
				>
					Generate a token
				</a>
				to ensure that every feature works correctly.
				<a
					href="https://github.com/refined-github/refined-github/wiki/Security"
				>
					More info
				</a>
			</li>

			<li
				class:valid={stepValid >= 3}
				class:visible={stepVisible >= 3}
				class="will-show"
			>
				<label for="token-input">Paste token:</label>
				<input
					id="token-input"
					type="text"
					size="10"
					autocomplete="off"
					name="personalToken"
					bind:value={tokenInput}
				/>
				{#if tokenError}
					<span class="error">{tokenError}</span>
				{/if}
			</li>
		</ul>
	</div>

	<footer>
		<h2 class:visible={stepValid === 3} class="will-show">
			Setup complete, redirecting to
			<a
				class="hidden-link"
				href="https://github.com/refined-github/refined-github/wiki"
				target="_self">GitHub</a
			>…
		</h2>
	</footer>
</main>

<style>
	:host {
		font-size: 2em;
		display: grid;

		--content-width: 60rem;
		--viewport-margin: 30px;
	}

	:host * {
		box-sizing: border-box;
	}

	main {
		transition: opacity 1s;
		margin-bottom: 2em;
	}

	footer {
		margin-top: 50px;
	}

	h2 {
		font-size: clamp(1.2em, 4vw, 1.5em);
		padding-inline: var(--viewport-margin);
		max-width: var(--content-width);
		font-weight: 200;
		margin: auto;
	}

	.content {
		padding-inline: var(--viewport-margin);
	}

	ul {
		list-style: none;
		margin: 30px auto;
		max-width: var(--content-width);
		padding: var(--viewport-margin) 0;
	}

	a,
	button {
		all: initial;
		font: inherit;
		text-decoration: underline;
		color: cornflowerblue;
		cursor: pointer;
	}

	.hidden-link {
		color: inherit;
	}

	li {
		margin-block: 1em;
		padding-left: 1.8em;
	}

	input {
		background: light-dark(#f6f8fa, #151b23);
		border: solid 1px light-dark(#d0d9e0, #3d444d);
		border-radius: 6px;
		padding: 5px 12px;
		font-size: inherit;
		line-height: 20px;
		margin-left: 0.5em;
	}

	input:focus {
		background: light-dark(#fff, #0d1117);
		border-color: #1f6feb;
		box-shadow: inset 0 0 0 1px #1f6feb;
		outline: none;
	}

	li::before {
		content: '';
		display: inline-block;
		width: 1em;
		height: 1em;
		vertical-align: -0.2em;
		margin-right: 0.8em;
		margin-left: -1.8em; /* Pull out */
		background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill-rule="evenodd" fill="gray" d="M8 5.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM4 8a4 4 0 118 0 4 4 0 01-8 0z"></path></svg>');
		background-size: contain;
	}

	li.valid::before {
		background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill-rule="evenodd" fill="%2328a745" d="M8 16A8 8 0 108 0a8 8 0 000 16zm3.78-9.72a.75.75 0 00-1.06-1.06L6.75 9.19 5.28 7.72a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l4.5-4.5z"></path></svg>');
	}

	.will-show {
		animation: fade-in 0.5s;
		animation-play-state: paused;
	}

	.will-show.visible {
		animation-play-state: running;
	}

	.dimmed {
		opacity: 40%;
	}

	.error {
		color: #cf222e;
		font-size: 0.8em;
	}

	@keyframes fade-in {
		from {
			opacity: 0%;
		}
	}
</style>
