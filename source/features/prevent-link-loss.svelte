<script lang="ts">
	import debounceFn from 'debounce-fn';
	import AlertIcon from 'octicons-plain-react/Alert';
	import {onMount} from 'svelte';

	import BannerAction from '../components/banner-action.svelte';
	import Banner from '../components/banner.svelte';
	import {
		avoidLinkLoss,
		isVulnerableToLinkLoss,
	} from '../github-helpers/prevent-link-loss.js';

	const {field} = $props<{field: HTMLTextAreaElement}>();
	let visible = $state(false);

	function update(): void {
		visible = isVulnerableToLinkLoss(field.value);
	}

	const debouncedUpdate = debounceFn(update, {
		wait: 300,
	});

	function fix(): void {
		avoidLinkLoss(field);
		update();
	}

	onMount(() => {
		update();

		const controller = new AbortController();
		field.addEventListener('input', debouncedUpdate, {signal: controller.signal});
		field.addEventListener('focus', update, {signal: controller.signal});

		return () => {
			controller.abort();
		};
	});
</script>

{#if visible}
	<Banner classes={['flash-warn', 'my-2']} icon={AlertIcon}>
		{#snippet text()}
			Your link may be <a
				href="https://github.com/refined-github/refined-github/wiki/Extended-feature-descriptions#prevent-link-loss"
				target="_blank"
				rel="noopener noreferrer"
				data-hovercard-type="issue"
			>misinterpreted</a> by GitHub.
		{/snippet}
		<BannerAction action={fix}>
			Fix link
		</BannerAction>
	</Banner>
{/if}
