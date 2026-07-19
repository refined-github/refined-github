<script lang="ts">
	import AlertIcon from 'octicons-plain-react/Alert';
	import InfoIcon from 'octicons-plain-react/Info';

	import {brokenFeatures} from '../helpers/hotfix.js';
	import openOptions from '../helpers/open-options.js';
	import {createRghIssueLink} from '../helpers/rgh-links.js';
	import optionsStorage, {isFeatureDisabled} from '../options-storage.js';
	import BannerAction from './banner-action.svelte';
	import Banner from './banner.svelte';
	import Dom from './dom-chef.svelte';

	const {id}: {id: string} = $props();

	type DisabledState =
		| {kind: 'hotfixed-permanent'; issue: string}
		| {kind: 'hotfixed-temporary'; issue: string; unaffectedVersion: string}
		| {kind: 'user-disabled'}
		| {kind: 'enabled'};

	async function getDisabledState(): Promise<DisabledState> {
		const hotfixes = await brokenFeatures.get() ?? [];
		const hotfixed = hotfixes.find(([feature]) => feature === id);
		if (hotfixed) {
			const [_name, issue, unaffectedVersion] = hotfixed;
			return unaffectedVersion
				? {kind: 'hotfixed-temporary', issue, unaffectedVersion}
				: {kind: 'hotfixed-permanent', issue};
		}

		if (isFeatureDisabled(await optionsStorage.getAll(), id)) {
			return {kind: 'user-disabled'};
		}

		return {kind: 'enabled'};
	}

	const disabledState = getDisabledState();
	const bannerClasses = ['mb-3', 'd-inline-block', 'width-full'];
</script>

{#await disabledState then state}
	{#if state.kind === 'hotfixed-temporary'}
		<Banner classes={bannerClasses} icon={InfoIcon}>
			{#snippet text()}
				This feature was disabled until version {state.unaffectedVersion} due to
				<Dom as={() => createRghIssueLink(state.issue)} />.
			{/snippet}
		</Banner>
	{:else if state.kind === 'hotfixed-permanent'}
		<Banner classes={[...bannerClasses, 'flash-warn']} icon={AlertIcon}>
			{#snippet text()}
				This feature is disabled due to <Dom
					as={() => createRghIssueLink(state.issue)}
				/>.
			{/snippet}
		</Banner>
	{:else if state.kind === 'user-disabled'}
		<Banner
			classes={[...bannerClasses, 'flash-warn']}
			icon={AlertIcon}
		>
			{#snippet text()}You disabled this feature on GitHub.com.{/snippet}
			<BannerAction action={(event) => openOptions(event, id)}>
				Refined GitHub Options
			</BannerAction>
		</Banner>
	{/if}
{/await}
