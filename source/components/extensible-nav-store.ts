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
	demoted?: true | string; // User-visible reason for demotion, e.g. "empty" or "disabled"
	/** Tabs should only be removed if we know they lead to a 404 */
	removed?: boolean;
	selected?: () => boolean | Promise<boolean>;
};

type ExtraTab = {tab: Tab; after?: string};
type TabOverride = Partial<Pick<Tab, 'href' | 'label' | 'counter' | 'tooltip' | 'demoted' | 'removed'>>;

const nativeTabs = writable<Tab[]>([]);
const extraTabs = writable<ExtraTab[]>([]);
const overrides = writable(new Map<string, TabOverride>());

export const selectedId = writable<string | undefined>();

export const tabs = derived(
	[nativeTabs, extraTabs, overrides],
	([$nativeTabs, $extraTabs, $overrides]) => {
		const tabs = $nativeTabs.map(tab => ({...tab, ...$overrides.get(tab.id)}));

		const inserted = new Map<string, number>();
		for (const {tab, after} of $extraTabs) {
			const extraTab = {...tab, ...$overrides.get(tab.id)};
			if (!after) {
				tabs.push(extraTab);
				continue;
			}

			// Without the tab it should follow (e.g. disabled issues), there's nowhere to put it
			const index = tabs.findIndex(({id}) => id === after);
			if (index === -1) {
				continue;
			}

			// Keep the call order among tabs added after the same tab
			const offset = inserted.get(after) ?? 0;
			tabs.splice(index + 1 + offset, 0, extraTab);
			inserted.set(after, offset + 1);
		}

		const demoted = tabs.filter(tab => tab.demoted);
		const rest = tabs.filter(tab => !tab.demoted);

		return [...rest, ...demoted];
	},
);

export function setNativeTabs(nativeTabsList: Tab[]): void {
	nativeTabs.set(nativeTabsList);
}

export function selectTab(id: string): void {
	selectedId.set(id);
}

export function addTab(tab: Tab, after?: string): void {
	extraTabs.update(current => [...current, {tab, after}]);

	// TODO: Should probably trigger `updateCurrentTab` reactively somehow, but this works for now
	if (tab.selected) {
		void (async () => {
			if (await tab.selected!()) {
				selectTab(tab.id);
			}
		})();
	}
}

export function overrideTab(id: string, override: TabOverride): void {
	overrides.update(current => new Map(current).set(id, {...current.get(id), ...override}));
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
