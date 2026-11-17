<script lang="ts">
	import RepoIcon from 'octicons-plain-react/Repo';

	import DomChef from '../components/dom-chef.svelte';
	import {randomArrayItem} from '../helpers/math.js';

	type Props = {
		createdAt: string;
		firstCommitDate: string;
		lastCommitsPageUrl: string;
	};

	const {createdAt, firstCommitDate, lastCommitsPageUrl}: Props = $props();

	const fresh = [
		'Freshly baked',
		'Freshly brewed',
		'Newly minted',
		'Hot off the presses',
		'Straight out of the oven',
		'Still hot',
		'Smells fresh',
		'Just a baby',
		'It’s my birthday',
		'Brand spanking new',
		'It’s a new world ✨',
		'Certified Fresh Repo™',
		'So it begins, the great battle of our time',
	];
	const freshLabel = randomArrayItem(fresh);
	const dayInMs = 24 * 60 * 60 * 1000;
	const now = new Date();

	const dateFormatter = new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});

	const birthday = $derived(new Date(createdAt));
	const firstCommit = $derived(new Date(firstCommitDate));
	const year = $derived(birthday.getFullYear());
	const month = $derived(birthday.toLocaleString('en-US', {month: 'long'}));
	const ageInMs = $derived(now.getTime() - birthday.getTime());
	const days = $derived(Math.floor(ageInMs / dayInMs));

	// About a day old or less ?
	const isFresh = $derived(ageInMs < 10e7);

	// The creation date is trustworthy, but the history may have been imported, so the first commit can be older. Newer commits are ignored
	const firstCommitIsOlder = $derived(
		firstCommit.getTime() <= birthday.getTime() - (365 * dayInMs),
	);
</script>

<h3 class="sr-only">Repository age</h3>
<div class="mt-2 tmp-mt-2">
	<a
		href={lastCommitsPageUrl}
		class="Link--muted"
		title="Created on {dateFormatter.format(birthday)}"
	>
		<DomChef as={RepoIcon} class="mr-2 tmp-mr-2" />
		{#if isFresh}
			{freshLabel}
		{:else if firstCommitIsOlder}
			<!-- Differences under a year are ignored -->
			<strong>{year}</strong> repo
		{:else if days < 30}
			<strong>{days}</strong> {days === 1 ? 'day' : 'days'} old
		{:else if year === now.getFullYear()}
			since <strong>{month}</strong>
		{:else if year === now.getFullYear() - 1}
			since <strong>{month} {year}</strong>
		{:else}
			since <strong>{year}</strong>
		{/if}
	</a>
	{#if firstCommitIsOlder}
		•
		<a
			href={lastCommitsPageUrl}
			class="Link--muted"
			title="First commit dated {dateFormatter.format(firstCommit)}"
		>
			<strong>{firstCommit.getFullYear()}</strong> commit
		</a>
	{/if}
</div>
