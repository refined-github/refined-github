<svelte:options
	customElement={{
		tag: 'rgh-options',
		shadow: 'none',
		props: {
			host: {
				reflect: true,
				type: 'String',
			},
		},
	}}
/>

<script lang="ts">
	import ActionLink from './options/action-link.svelte';
	import BackgroundStatus from './options/background-status.svelte';
	import FeatureCount from './options/feature-count.svelte';
	import FeatureFinder from './options/feature-finder.svelte';
	import FeatureList from './options/feature-list.svelte';
	import HandleExpand from './options/handle-expand.svelte';
	import Header from './options/header.svelte';
	import HotFixes from './options/hotfixes.svelte';
	import RateLink from './options/rate-link.svelte';
	import StorageUsage from './options/storage-usage.svelte';
	import TokenInput from './options/token-input.svelte';
	import VersionInfo from './options/version-info.svelte';

	const {domain = 'default'} = $props();
	const enterprise = $derived(domain !== 'default');
	const optionsStorageKey = $derived.by(() =>
		domain === 'default' ? 'options' : 'options-' + domain
	);
</script>

<Header title="Refined GitHub" withVersion>
	<p>
		Visit the <a href="https://github.com/refined-github/refined-github/wiki"
		>wiki</a> to learn about updates, debugging, and GitHub Enterprise. You can
		<RateLink>rate Refined GitHub</RateLink> to help others find it. Follow or
		sponsor <a href="https://github.com/sponsors/fregante">@fregante</a> if
		Refined GitHub helps you work more efficiently. 🍻
	</p>
</Header>

<form id="options-form" class="detail-view-container">
	<!-- Captures and ignores native enter-to-submit action -->
	<button type="submit" hidden>Capture Submit</button>

	<BackgroundStatus />

	<HandleExpand>
		<details id="token">
			<summary><strong>🔑 Personal token</strong></summary>
			<!-- Keep this URL in sync with welcome.svelte -->
			<p>
				You should
				<a
					id="personal-token-link"
					href={`https://${
						domain === 'default' ? 'github.com' : domain
					}/settings/tokens/new?description=Refined%20GitHub&scopes=repo,read:project,workflow&default_expires_at=none`}
				>
					generate a token
				</a>
				to ensure that every feature works correctly. You can read more about
				the token on
				<a href="https://github.com/refined-github/refined-github/wiki/Security"
				>the wiki.</a>
			</p>
			<p><strong>Token-less usage is not officially supported.</strong></p>
			<TokenInput />
		</details>
	</HandleExpand>

	<HandleExpand>
		<details id="toggle-all" hidden>
			<summary><strong>🏳️ Toggle all features</strong></summary>
			<p>
				If you're trying to identify a feature, please use "Identify feature"
				instead. Refined GitHub only implements lightweight features that are
				helpful to most people, even if they're tiny improvements. They're meant
				to "blend in" and fill in the gaps of GitHub's interface.
			</p>
			<p>
				If you want to go through and only select a few improvements, you'll
				miss out on the best parts of Refined GitHub. Also note that new
				features will still be enabled by default and that some CSS-only
				refinements cannot be disabled.
			</p>
			<p>
				<button id="disable-all-features" type="button"
				>Disable all features</button>
				<button id="enable-all-features" type="button"
				>Enable all features</button>
			</p>
		</details>
	</HandleExpand>

	<HandleExpand>
		<details id="features">
			<!-- No space, there's a colon after "Features" -->
			<summary><strong>🔋 Features<FeatureCount /></strong></summary>
			<FeatureList />
		</details>
	</HandleExpand>

	<HandleExpand>
		<details id="bisect">
			<summary><strong>🔎 Identify feature</strong></summary>
			<FeatureFinder />
		</details>
	</HandleExpand>

	<HandleExpand>
		<details id="css">
			<summary><strong>💅 Custom CSS</strong></summary>
			<p>Like a userstyle, useful to undo unwanted style changes</p>

			<!-- eslint-disable-next-line @html-eslint/require-input-label -->
			<p>
				<textarea
					class="monospace-field text-code"
					name="customCss"
					rows="2"
					spellcheck="false"
				></textarea>
			</p>

			<p>
				Options storage:
				<StorageUsage
					area="sync"
					item={optionsStorageKey}
				/>
			</p>

			<p>
				When the storage is full, the options
				<a href="https://github.com/fregante/webext-options-sync/issues/27">
					will stop being saved
				</a>. If you need to use a lot of CSS, use a dedicated userstyle
				extension.
			</p>
		</details>
	</HandleExpand>

	<HandleExpand>
		<ActionLink {enterprise} />
	</HandleExpand>

	<HandleExpand>
		<details id="debugging">
			<summary><strong>🐛 Debugging</strong></summary>

			<p>
				<label>
					<input type="checkbox" name="logging" />
					Show the features enabled on each page in the console
				</label>
			</p>

			<p>
				<label>
					<input type="checkbox" name="logHttp" />
					Log API calls in the console
				</label>
			</p>

			<p>
				Options storage:
				<StorageUsage area="sync" item={optionsStorageKey} />
				<br />
				Cache storage:
				<StorageUsage area="local" />
				<br />
				Refined Github version:
				<VersionInfo />
			</p>

			<p>
				<button id="clear-cache" type="button">Clear cache</button>
			</p>

			<p>
				<!-- Native link that looks like a button (to blend in better). Don't @ me -->
				<button type="submit" form="welcome-page-link">
					Open welcome page
				</button>
			</p>

			<p>
				<button type="submit" form="graphql-page-link">
					Open GraphQL tester
				</button>
			</p>

			<p>
				<button id="toggle-all-features" type="button">
					Toggle all features…
				</button>
			</p>
		</details>
	</HandleExpand>

	<HandleExpand>
		<details id="hotfixes">
			<summary><strong>☄️ Hotfixes</strong></summary>
			<HotFixes {enterprise} />
		</details>
	</HandleExpand>

	<HandleExpand>
		<details id="export">
			<summary><strong>🗄️ Export options</strong></summary>

			<p>
				You can export and import options across browsers and devices via a JSON
				file. If you're a GitHub Enterprise user, you will need to export each
				domain separately.
			</p>

			<p>
				<strong>Note</strong> that your options include your access token if
				provided.
			</p>

			<p>
				<button type="button" class="js-export">Export</button>
				<button type="button" class="js-import">Import</button>
			</p>
		</details>
	</HandleExpand>
</form>

<!-- Native link that looks like a button (to blend in better). Don't @ me -->
<form
	id="welcome-page-link"
	action="./welcome.html"
	method="get"
	target="_blank"
></form>
<form
	id="graphql-page-link"
	action="./graphql.html"
	method="get"
	target="_blank"
></form>
