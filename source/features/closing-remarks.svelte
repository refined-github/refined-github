<script lang="ts">
	import TagIcon from 'octicons-plain-react/Tag';

	import BannerAction from '../components/banner-action.svelte';
	import Banner from '../components/banner.svelte';
	import TimelineItem from '../components/timeline-item.svelte';
	import {userHasPushAccess} from '../github-helpers/get-user-permission.js';
	import {buildRepoUrl, isRefinedGitHubRepo} from '../github-helpers/index.js';
	import {doesRepoHaveAnyTags} from './releases-tab.js';

	type Props = {
		tagName?: string;
		postMerge?: boolean;
	};

	const {tagName, postMerge = false}: Props = $props();

	const explanationHref =
		'https://github.com/refined-github/refined-github/wiki/Extended-feature-descriptions#closing-remarks';

	function createReleaseUrl(): string {
		return isRefinedGitHubRepo()
			? 'https://github.com/refined-github/refined-github/actions/workflows/release.yml'
			: buildRepoUrl('releases/new');
	}
</script>

{#if tagName}
	<TimelineItem>
		<Banner classes={['flash-success', 'rgh-bg-none']} icon={TagIcon}>
			{#snippet text()}
				This pull request first <a href={explanationHref}>appeared</a> in
				<a
					href={buildRepoUrl('releases/tag', tagName)}
					class="Link--primary text-bold"
				>{tagName}</a>
			{/snippet}
		</Banner>
	</TimelineItem>
{:else}
	{#await doesRepoHaveAnyTags() then hasAnyTags}
		{#if hasAnyTags}
			<TimelineItem>
				<Banner classes={['rgh-bg-none']} icon={TagIcon}>
					{#snippet text()}
						{#if postMerge}
							Now you can release this change
						{:else}
							No <a href={explanationHref}>stable version tags</a> for this PR.
						{/if}
					{/snippet}
					{#await userHasPushAccess() then hasPushAccess}
						{#if hasPushAccess}
							<BannerAction action={createReleaseUrl()}>
								Draft a new release
							</BannerAction>
						{/if}
					{/await}
				</Banner>
			</TimelineItem>
		{/if}
	{/await}
{/if}
