<script lang="ts">
	import AlertIcon from 'octicons-plain-react/Alert';
	import {onMount} from 'svelte';
	import {replaceFieldText} from 'text-field-edit';

	import DomChef from '../components/dom-chef.svelte';
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
	<div class="flash flash-warn my-2">
		<DomChef as={AlertIcon} class="m-0 tmp-m-0" />
		Your link may be <a
			href="https://github.com/refined-github/refined-github/wiki/Extended-feature-descriptions#prevent-link-loss"
			target="_blank"
			rel="noopener noreferrer"
			data-hovercard-type="issue"
		>misinterpreted</a> by GitHub.
		<button
			type="button"
			class="btn btn-sm flash-action"
			onclick={fix}
		>
			Fix link
		</button>
	</div>
{/if}
