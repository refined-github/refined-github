import type AnyIcon from 'octicons-plain-react/Code';
import {writable} from 'svelte/store';

export type Tab = {
	id: string;
	href: string;
	label: string;
	icon: typeof AnyIcon;
	counter?: string;
	selected?: boolean;
};

export const tabs = writable<Tab[]>([]);

export function addTab(tab: Tab, before?: string): void {
	tabs.update(current => {
		const index = before ? current.findIndex(item => item.id === before) : -1;
		const next = [...current];
		next.splice(index === -1 ? next.length : index, 0, tab);
		return next;
	});
}

export function updateTab(id: string, changes: Partial<Tab>): void {
	tabs.update(current => current.map(tab => (tab.id === id ? {...tab, ...changes} : tab)));
}

export function removeTab(id: string): void {
	tabs.update(current => current.filter(tab => tab.id !== id));
}

export function selectTab(id: string): void {
	tabs.update(current => current.map(tab => ({...tab, selected: tab.id === id})));
}
