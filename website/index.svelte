<script lang="ts">
	import Header from '../source/options/header.svelte';

	type Feature = {
		id: string;
		description: string;
		screenshot: string | null;
		fire: boolean;
	};
	type Group = {name: string; features: Feature[]};

	const {groups}: {groups: Group[]} = $props();
	const highlights = $derived(
		groups.find(group => group.name === 'Highlights')?.features ?? [],
	);
	const others = $derived(groups.filter(group => group.name !== 'Highlights'));
	const count = $derived(
		groups.reduce((sum, group) => sum + group.features.length, 0),
	);
	const slug = (name: string) => name.toLowerCase().replaceAll(/\W+/g, '-');
</script>

<Header title="Refined GitHub">
	<p>
		Simplifies the GitHub interface and adds {count} useful features, from tiny
		fixes to big time-savers.
	</p>
	<ul class="install">
		<li><a
				href="https://chrome.google.com/webstore/detail/refined-github/hlepfoohegkhhmjieoechaddaejaokhf"
			>Chrome</a></li>
		<li><a href="https://addons.mozilla.org/firefox/addon/refined-github-/"
			>Firefox</a></li>
		<li><a href="https://apps.apple.com/app/id1519867270">Safari</a></li>
		<li><a href="https://github.com/refined-github/refined-github"
			>Source code</a></li>
	</ul>
</Header>

<main>
	<section id="highlights">
		<h2>Highlights 🔥</h2>
		<ul class="highlights">
			{#each highlights as feature (feature.id)}
				<li id={feature.id}>
					<p>{@html feature.description}</p>
					{#if feature.screenshot}
						<img src={feature.screenshot} alt="" loading="lazy" />
					{/if}
				</li>
			{/each}
		</ul>
	</section>

	{#each others as group (group.name)}
		<details id={slug(group.name)}>
			<summary><strong>{group.name}</strong> <small>({
						group.features.length
					})</small></summary>
			<ul class="features">
				{#each group.features as feature (feature.id)}
					<li id={feature.id}>
						{#if feature.fire}🔥{/if}
						{@html feature.description}
						{#if feature.screenshot}
							<a class="screenshot" href={feature.screenshot}>screenshot</a>
						{/if}
					</li>
				{/each}
			</ul>
		</details>
	{/each}
</main>

<footer>
	<p>
		<a href="https://github.com/refined-github/refined-github/wiki">Wiki</a>
		·
		<a href="https://github.com/refined-github/refined-github/issues">Issues</a>
		·
		<a href="https://github.com/sponsors/fregante">Sponsor @fregante</a>
	</p>
</footer>
