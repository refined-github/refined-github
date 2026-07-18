<script lang="ts">
	import CheckIcon from 'octicons-plain-react/Check';
	import CheckCircleIcon from 'octicons-plain-react/CheckCircle';
	import DotIcon from 'octicons-plain-react/Dot';
	import DotFillIcon from 'octicons-plain-react/DotFill';
	import GitMergeIcon from 'octicons-plain-react/GitMerge';
	import GitPullRequestIcon from 'octicons-plain-react/GitPullRequest';
	import GitPullRequestDraftIcon from 'octicons-plain-react/GitPullRequestDraft';
	import HubotIcon from 'octicons-plain-react/Hubot';
	import IssueOpenedIcon from 'octicons-plain-react/IssueOpened';
	import SquirrelIcon from 'octicons-plain-react/Squirrel';
	import TriangleDownIcon from 'octicons-plain-react/TriangleDown';
	import XCircleIcon from 'octicons-plain-react/XCircle';

	import DomChef from '../components/dom-chef.svelte';
	import {isSmallDevice} from '../helpers/dom-utils';
	import type {Category, Filter, Selection} from './select-notifications.js';

	type Props = {
		categories: Record<Category, Filter[]>;
		onSelectionChange: (_selection: Selection) => void;
	};

	const {categories, onSelectionChange}: Props = $props();

	const baseId = crypto.randomUUID();

	const icons: Record<Filter, typeof CheckIcon> = {
		'Pull requests': GitPullRequestIcon,
		Issues: IssueOpenedIcon,
		Others: SquirrelIcon,
		Bots: HubotIcon,
		Open: CheckCircleIcon,
		Closed: XCircleIcon,
		Draft: GitPullRequestDraftIcon,
		Merged: GitMergeIcon,
		Read: DotIcon,
		Unread: DotFillIcon,
	};

	const iconColors: Partial<Record<Filter, string>> = {
		Open: 'color-fg-success',
		Closed: 'color-fg-danger',
		Draft: 'color-fg-subtle',
		Merged: 'color-fg-done',
		Read: 'color-fg-accent',
		Unread: 'color-fg-accent',
	};

	let selection = $state<Selection>({Type: [], Status: [], Read: []});

	function isSelected(category: Category, filter: Filter): boolean {
		return selection[category].includes(filter);
	}

	function toggle(category: Category, filter: Filter): void {
		selection[category] = isSelected(category, filter)
			? selection[category].filter(value => value !== filter)
			: [...selection[category], filter];
		onSelectionChange({...selection});
	}

	function reset(): void {
		selection = {Type: [], Status: [], Read: []};
	}
</script>

<span class="ml-2 tmp-ml-2">·</span>
<action-menu
	class="rgh-select-notifications flex-shrink-0"
	data-select-variant="multiple"
>
	<focus-group direction="vertical" mnemonics retain>
		<button
			id={`${baseId}-button`}
			popovertarget={`${baseId}-overlay`}
			aria-controls={`${baseId}-list`}
			aria-haspopup="true"
			data-hotkey="Shift+S"
			type="button"
			class="Button--small Button"
		>
			<span class="Button-content">
				<span class="Button-label">Select by</span>
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
			ontoggle={reset}
		>
			<div class="Overlay">
				<div class="Overlay-body Overlay-body--paddingNone">
					<action-list>
						<ul
							id={`${baseId}-list`}
							aria-labelledby={`${baseId}-button`}
							role="menu"
							class="ActionListWrap--inset ActionListWrap"
						>
							{#each Object.entries(categories) as [category, categoryFilters] (category)}
								<li role="none" class="ActionList-sectionDivider">
									<h3 class="ActionList-sectionDivider-title">{category}</h3>
								</li>
								{#each categoryFilters as filter (filter)}
									<li
										data-targets="action-list.items"
										role="none"
										class="ActionListItem"
									>
										<button
											type="button"
											role="menuitemcheckbox"
											class="ActionListContent"
											aria-checked={isSelected(category as Category, filter)}
											onclick={() => {
												toggle(category as Category, filter);
											}}
										>
											<span
												class="ActionListItem-visual ActionListItem-action--leading"
											>
												<DomChef
													as={CheckIcon}
													class="ActionListItem-singleSelectCheckmark"
												/>
											</span>
											<span
												class="ActionListItem-label d-flex flex-items-center gap-2"
											>
												<DomChef
													as={icons[filter]}
													class={iconColors[filter] ?? 'color-fg-muted'}
												/>
												{filter}
											</span>
										</button>
									</li>
								{/each}
							{/each}
						</ul>
					</action-list>
				</div>
				{#if !isSmallDevice()}
					<div class="Overlay-footer Overlay-footer--divided py-2 tmp-py-2">
						<span class="color-fg-muted">
							You can press <kbd>Shift</kbd> + <kbd>S</kbd> to open this menu.
						</span>
					</div>
				{/if}
			</div>
		</anchored-position>
	</focus-group>
</action-menu>
