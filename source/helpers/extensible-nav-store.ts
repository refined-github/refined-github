import type CodeIcon from 'octicons-plain-react/Code';
import {$} from 'select-dom';
import {derived, get, type Readable, writable} from 'svelte/store';

export type Tab = {
	id: string;
	href: string;
	label: string;
	icon: typeof CodeIcon;
	reactNav?: string;
	counter?: Readable<number | string | undefined>;
	tooltip?: string;
	selected?: () => boolean | Promise<boolean>;
};

type ExtraTab = {tab: Tab; before?: string};

const nativeTabs = writable<Tab[]>([]);
const extraTabs = writable<ExtraTab[]>([]);
const hiddenIds = writable(new Set<string>());

export const selectedId = writable<string | undefined>();

export const tabs = derived(
	[nativeTabs, extraTabs, hiddenIds],
	([$nativeTabs, $extraTabs, $hiddenIds]) => {
		const tabs = $nativeTabs.filter(({id}) => !$hiddenIds.has(id));

		for (const {tab, before} of $extraTabs) {
			const index = before ? tabs.findIndex(({id}) => id === before) : -1;
			tabs.splice(index === -1 ? tabs.length : index, 0, tab);
		}

		return tabs;
	},
);

export function setNativeTabs(nativeTabsList: Tab[]): void {
	nativeTabs.set(nativeTabsList);
}

export function selectTab(id: string): void {
	selectedId.set(id);
}

export function addTab(tab: Tab, before?: string): void {
	extraTabs.update(current => [...current, {tab, before}]);

	// TODO: Should probably trigger `updateCurrentTab` reactively somehow, but this works for now
	if (tab.selected) {
		void (async () => {
			if (await tab.selected!()) {
				selectTab(tab.id);
			}
		})();
	}
}

export function hideTab(id: string): void {
	hiddenIds.update(current => new Set(current).add(id));
}

export async function updateCurrentTab(): Promise<void> {
	for (const {tab} of get(extraTabs)) {
		// eslint-disable-next-line no-await-in-loop -- Tabs must be tried in order, first match wins
		if (await tab.selected?.()) {
			selectTab(tab.id);
			return;
		}
	}

	const currentTab = $('nav[aria-label="Repository"] a[aria-current][data-tab-item]');
	selectTab(currentTab.getAttribute('data-tab-item')!);
}
