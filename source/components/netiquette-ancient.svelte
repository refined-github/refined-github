<script lang="ts">
	import * as pageDetect from 'github-url-detection';
	import twas from 'twas';

	import {
		areDiscussionsEnabled,
		areIssuesEnabled,
		buildRepoUrl,
	} from '../github-helpers/index.js';

	const {closingDate}: {closingDate: Date} = $props();

	const issuesEnabled = areIssuesEnabled();
	const discussionsEnabled = areDiscussionsEnabled();
</script>

This {pageDetect.isPR() ? 'PR' : 'issue'} was closed <strong>{
	twas(closingDate.getTime())
}</strong>. Please consider opening a
{#if issuesEnabled}
	<a href={buildRepoUrl('issues/new/choose')}>new issue</a>
{/if}
{#if issuesEnabled && discussionsEnabled}
	or a
{/if}
{#if discussionsEnabled}
	<a href={buildRepoUrl('discussions/new/choose')}>new discussion</a>
{/if}
instead of leaving a comment here.
