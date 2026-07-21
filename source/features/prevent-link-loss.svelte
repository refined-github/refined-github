<script lang="ts">
	import AlertIcon from 'octicons-plain-react/Alert';
	import {onMount} from 'svelte';
	import {replaceFieldText} from 'text-field-edit';

	import BannerAction from '../components/banner-action.svelte';
	import Banner from '../components/banner.svelte';
	import {
		discussionUrlRegex,
		isVulnerableToLinkLoss,
		prCommitUrlRegex,
		prCompareUrlRegex,
		preventDiscussionLinkLoss,
		preventPrCommitLinkLoss,
		preventPrCompareLinkLoss,
	} from '../github-helpers/prevent-link-loss';

	const {field} = $props<{field: HTMLTextAreaElement}>();

	let visible = $state(false);

	function update(): void {
		visible = isVulnerableToLinkLoss(field.value);
	}

	function fix(): void {
		replaceFieldText(field, prCommitUrlRegex, preventPrCommitLinkLoss);
		replaceFieldText(field, prCompareUrlRegex, preventPrCompareLinkLoss);
		replaceFieldText(field, discussionUrlRegex, preventDiscussionLinkLoss);
		update();
	}

	onMount(() => {
		update();

		field.addEventListener('input', update);
		field.addEventListener('focus', update);

		return () => {
			field.removeEventListener('input', update);
			field.removeEventListener('focus', update);
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
