<script lang="ts">
	import CheckIcon from 'octicons-plain-react/Check';
	import CommentIcon from 'octicons-plain-react/Comment';
	import FileDiffIcon from 'octicons-plain-react/FileDiff';
	import XIcon from 'octicons-plain-react/X';

	import DomChef from '../helpers/dom-chef.svelte';
	import type {
		ReviewAction,
		ReviewActionValue,
	} from '../helpers/review-submission.js';

	type Props = {
		actions: ReviewAction[];
		onSubmit: (_value: ReviewActionValue) => void;
		onRestore: () => void;
	};

	const {actions, onSubmit, onRestore}: Props = $props();
	let visible = $state(true);

	const icons = {
		comment: CommentIcon,
		approve: CheckIcon,
		'request changes': FileDiffIcon,
	} as const;

	function restore(): void {
		visible = false;
		onRestore();
	}
</script>

{#if visible}
	<div class="rgh-one-click-review-submission d-flex flex-items-center gap-2">
		{#each actions as action (action.value)}
			<button
				type="button"
				class="Button Button--small"
				class:Button--primary={action.value === 'approve'}
				class:Button--danger={action.value === 'request changes'}
				disabled={action.disabled}
				title={action.description}
				data-rgh-review-action={action.value}
				onclick={() => onSubmit(action.value)}
			>
				<span class="Button-content">
					<span class="Button-visual Button-leadingVisual">
						<DomChef
							as={icons[action.value]}
							class={action.value === 'approve'
							? 'color-fg-success'
							: action.value === 'request changes'
							? 'color-fg-danger'
							: undefined}
						/>
					</span>
					<span class="Button-label">{action.label}</span>
				</span>
			</button>
		{/each}
		<button
			type="button"
			class="Button Button--small Button--invisible"
			aria-label="Restore GitHub's review controls"
			title="Restore GitHub's review controls"
			onclick={restore}
		>
			<span class="Button-content">
				<span class="Button-visual">
					<DomChef as={XIcon} />
				</span>
			</span>
		</button>
	</div>
{/if}
