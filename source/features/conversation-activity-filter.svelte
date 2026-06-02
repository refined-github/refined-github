<script lang="ts">
	import CheckIcon from 'octicons-plain-react/Check';
	import EyeClosedIcon from 'octicons-plain-react/EyeClosed';
	import EyeIcon from 'octicons-plain-react/Eye';
	import TriangleDownIcon from 'octicons-plain-react/TriangleDown';
	import {tick} from 'svelte';

	import {isSmallDevice} from '../helpers/dom-utils.js';
	import DomChef from '../helpers/dom-chef.svelte';

	const states = {
		showAll: 'Show all activities',
		hideEvents: 'Hide events',
		hideAllNoise: 'Hide events, bots, collapsed comments',
	} as const;

	type State = keyof typeof states;
	type MenuElement = HTMLElement & {
		onStateChange?: (state: State) => void;
		updateState?: (state: State) => Promise<void>;
	};

	const {
		state,
		onStateChange,
		withMargin = false,
	}: {
		state: State;
		onStateChange: (state: State) => void;
		withMargin?: boolean;
	} = $props();

	const baseId = crypto.randomUUID();
	let currentState = $state(state);
	let menu: MenuElement | undefined;

	$effect(() => {
		currentState = state;
	});

	$effect(() => {
		if (!menu) {
			return;
		}

		const element = menu;
		element.onStateChange = onStateChange;
		element.updateState = async targetState => {
			currentState = targetState;
			await tick();
			element.querySelector<HTMLElement>(`[data-state="${targetState}"]`)?.focus();
		};

		return () => {
			delete element.onStateChange;
			delete element.updateState;
		};
	});
</script>

<action-menu
	bind:this={menu}
	class={`caf-menu d-inline-block position-relative lh-condensed-ultra v-align-middle ${
		withMargin ? 'ml-2' : ''
	}`}
	data-select-variant="single"
>
	<focus-group direction="vertical" mnemonics retain>
		<button
			id={`${baseId}-button`}
			/* @ts-expect-error HTML standard */
			popovertarget={`${baseId}-overlay`}
			aria-controls={`${baseId}-list`}
			aria-haspopup="true"
			type="button"
			class="Button--small Button color-fg-muted p-0 tmp-p-0"
		>
			<span class="Button-content">
				<span class="Button-visual Button-leadingVisual">
					<DomChef as={EyeIcon} class="eye" />
					<DomChef as={EyeClosedIcon} class="eye-closed color-fg-danger" />
				</span>
				<span class="Button-label lh-condensed-ultra">
					<span class="events-label v-align-text-top color-fg-danger">events</span>
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
								<li data-targets="action-list.items" role="none" class="ActionListItem">
									<button
										data-state={itemState}
										id={`item-${crypto.randomUUID()}`}
										type="button"
										role="menuitemradio"
										class="ActionListContent item"
										aria-checked={`${itemState === currentState}`}
									>
										<span class="ActionListItem-visual ActionListItem-action--leading">
											<DomChef as={CheckIcon} class="ActionListItem-singleSelectCheckmark" />
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

<style>
	.caf-menu {
		.Button {
			height: fit-content;
		}

		.Button-leadingVisual {
			margin-right: 0 !important;
		}

		.eye-closed,
		.events-label {
			display: none;
		}
	}

	[data-rgh-conversation-activity-filter='hideEvents'] {
		.caf-menu {
			.eye {
				display: none;
			}

			.events-label,
			.eye-closed {
				display: inline-block;
			}

			.Button-leadingVisual {
				margin-right: var(--control-small-gap) !important;
			}
		}
	}

	[data-rgh-conversation-activity-filter='hideAllNoise'] {
		.caf-menu {
			.eye {
				display: none;
			}

			.eye-closed {
				display: inline-block;
			}
		}
	}
</style>
