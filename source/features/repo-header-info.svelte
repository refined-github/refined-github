<script lang="ts">
	import RepoForkedIcon from 'octicons-plain-react/RepoForked';
	import StarIcon from 'octicons-plain-react/Star';
	import StarFillIcon from 'octicons-plain-react/StarFill';

	import {buildRepoUrl} from '../github-helpers/index.js';
	import abbreviateNumber from '../helpers/abbreviate-number.js';
	import DomChef from '../helpers/dom-chef.svelte';
	import type {RepositoryInfo} from './repo-header-info.js';

	const {info}: {info: RepositoryInfo} = $props();
</script>
<!-- Order set because React rebuilds both breadcrumbs on resize, leaving this as the first child -->
<li class="d-none d-md-flex rgh-header-info" style:order="10">
	{#if info.forked}
		<a
			href={info.forked.url}
			class="d-flex flex-items-center flex-justify-center p-1 tmp-p-1 Button Button--invisible"
		>
			<DomChef as={RepoForkedIcon} class="m-0 tmp-m-0" width={12} height={12} />
		</a>
	{/if}

	{#if info.stargazerCount > 1}
		<a
			href={buildRepoUrl('stargazers')}
			title={`Repository starred by ${info.stargazerCount.toLocaleString('us')} people${
				info.viewerHasStarred ? ', including you' : ''
			}`}
			class="d-flex flex-items-center flex-justify-center gap-1 p-1 tmp-p-1 color-fg-muted Button Button--invisible"
		>
			<DomChef
				as={info.viewerHasStarred ? StarFillIcon : StarIcon}
				width={12}
				height={12}
				color={info.viewerHasStarred ? 'var(--button-star-iconColor)' : undefined}
			/>
			<span class="f5">{abbreviateNumber(info.stargazerCount)}</span>
		</a>
	{/if}

	{#if info.ciCommit}
		<span
			class="rgh-ci-link d-flex flex-items-center flex-justify-center p-1 tmp-p-1 Button Button--invisible"
			title="CI status of latest commit"
		>
			<batch-deferred-content
				hidden
				data-url={buildRepoUrl('commits/checks-statuses-rollups')}
			>
				<input
					name="oid"
					value={info.ciCommit}
					data-targets="batch-deferred-content.inputs"
				/>
			</batch-deferred-content>
		</span>
	{/if}
</li>
