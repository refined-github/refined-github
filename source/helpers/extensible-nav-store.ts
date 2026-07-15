import type CodeIcon from 'octicons-plain-react/Code';
import {derived, writable} from 'svelte/store';

export type Tab = {
	id: string;
	href: string;
	label: string;
	icon: typeof CodeIcon;
	counter?: string;
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

export function addTab(tab: Tab, before?: string): void {
	extraTabs.update(current => [...current, {tab, before}]);
}

export function hideTab(id: string): void {
	hiddenIds.update(current => new Set(current).add(id));
}

export function selectTab(id: string): void {
	selectedId.set(id);
}
