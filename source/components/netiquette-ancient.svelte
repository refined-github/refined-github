<script lang="ts">
	import * as pageDetect from 'github-url-detection';
	import twas from 'twas';

	import {
		areDiscussionsEnabled,
		areIssuesEnabled,
		buildRepoUrl,
	} from '../github-helpers/index.js';

	function whatToOpen(): 'both' | 'issues' | 'discussions' {
		if (areIssuesEnabled() && areDiscussionsEnabled()) return 'both';
		return areIssuesEnabled() ? 'issues' : 'discussions';
	}

	const {closingDate}: {closingDate: Date} = $props();
</script>

This {pageDetect.isPR() ? 'PR' : 'issue'} was closed <strong>{
	twas(closingDate.getTime())
}</strong>. Please consider opening a
{#if whatToOpen() === 'both'}
	<a href={buildRepoUrl('issues/new/choose')}>new issue</a> or a <a
		href={buildRepoUrl('discussions/new/choose')}
	>new discussion</a>
{:else if whatToOpen() === 'issues'}
	<a href={buildRepoUrl('issues/new/choose')}>new issue</a>
{:else}
	<a href={buildRepoUrl('discussions/new/choose')}>new discussion</a>
{/if}
instead of leaving a comment here.
