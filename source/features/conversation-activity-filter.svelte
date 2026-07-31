<script lang="ts">
	import CheckIcon from 'octicons-plain-react/Check';
	import EyeIcon from 'octicons-plain-react/Eye';
	import EyeClosedIcon from 'octicons-plain-react/EyeClosed';
	import TriangleDownIcon from 'octicons-plain-react/TriangleDown';

	import DomChef from '../components/dom-chef.svelte';
	import {
		activityFilterState,
		type State,
		states,
	} from '../helpers/conversation-activity-filter.js';
	import {isSmallDevice} from '../helpers/dom-utils.js';

	type Props = {
		onStateChange: (_value: State) => void;
		withMargin?: boolean;
	};
	const {onStateChange, withMargin = false}: Props = $props();

	const baseId = crypto.randomUUID();

	function selectState(targetState: State): void {
		activityFilterState.set(targetState);
		onStateChange(targetState);
	}
</script>
<action-menu
	class={`d-inline-block position-relative lh-condensed-ultra v-align-middle ${
		withMargin ? 'ml-2' : ''
	}`}
	data-select-variant="single"
>
	<focus-group direction="vertical" mnemonics retain>
		<button
			id={`${baseId}-button`}
			popovertarget={`${baseId}-overlay`}
			aria-controls={`${baseId}-list`}
			aria-haspopup="true"
			type="button"
			class="Button--small Button color-fg-muted Button Button--invisible"
		>
			<span class="Button-content">
				<span
					class="Button-visual Button-leadingVisual"
					class:mr-0={$activityFilterState === 'showAll' || $activityFilterState === 'hideAllNoise'}
				>
					{#if $activityFilterState !== 'showAll'}
						<DomChef as={EyeClosedIcon} class="color-fg-danger" />
					{:else}
						<DomChef as={EyeIcon} />
					{/if}
				</span>
				<span class="Button-label lh-condensed-ultra">
					<span
						hidden={$activityFilterState !== 'hideEvents'}
						class="v-align-text-top color-fg-danger"
					>events</span>
				</span>
				<span class="Button-visual Button-trailingVisual">
					<DomChef as={TriangleDownIcon} />
				</span>
			</span>
		</button>
		<anchored-position
			id={`${baseId}-overlay`}
			data-target="action-menu.overlay"
			anchor={`${baseId}-button`}
			align="start"
			side="outside-bottom"
			anchor-offset="normal"
			popover="auto"
		>
			<div class="Overlay Overlay--size-small-portrait">
				<div class="Overlay-body Overlay-body--paddingNone">
					<action-list>
						<ul
							id={`${baseId}-list`}
							aria-labelledby={`${baseId}-button`}
							role="menu"
							class="ActionListWrap--inset ActionListWrap"
						>
							{#each Object.entries(states) as [itemState, label] (itemState)}
								<li
									data-targets="action-list.items"
									role="none"
									class="ActionListItem"
								>
									<button
										data-state={itemState}
										id={`item-${crypto.randomUUID()}`}
										type="button"
										role="menuitemradio"
										class="ActionListContent"
										aria-checked={itemState === $activityFilterState}
										onclick={() => selectState(itemState as State)}
									>
										<span
											class="ActionListItem-visual ActionListItem-action--leading"
										>
											<DomChef
												as={CheckIcon}
												class="ActionListItem-singleSelectCheckmark"
											/>
										</span>
										<span class="ActionListItem-label">
											{label}
										</span>
									</button>
								</li>
							{/each}
						</ul>
					</action-list>
				</div>
				{#if !isSmallDevice()}
					<div class="Overlay-footer Overlay-footer--divided py-2 tmp-py-2">
						<span class="color-fg-muted">
							Press <kbd>h</kbd> to cycle through filters,
							<br />
							even when the dropdown is closed
						</span>
					</div>
				{/if}
			</div>
		</anchored-position>
	</focus-group>
</action-menu>
