import type CodeIcon from 'octicons-plain-react/Code';
import {get} from 'svelte/store';
import {beforeEach, expect, it, vi} from 'vitest';

import type {Tab} from './extensible-nav-store.js';

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const icon = {} as typeof CodeIcon;

function makeTab(id: string, extra: Partial<Tab> = {}): Tab {
	return {id, href: `/${id}`, label: id, icon, ...extra};
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function loadModule() {
	vi.resetModules();
	return import('./extensible-nav-store.js');
}

beforeEach(() => {
	vi.resetModules();
});

it('starts empty', async () => {
	const {tabs} = await loadModule();
	expect(get(tabs)).toEqual([]);
});

it('reflects native tabs', async () => {
	const {tabs, setNativeTabs} = await loadModule();
	const native = [makeTab('code'), makeTab('issues')];
	setNativeTabs(native);
	expect(get(tabs)).toEqual(native);
});

it('appends a tab with no "before"', async () => {
	const {tabs, setNativeTabs, addTab} = await loadModule();
	setNativeTabs([makeTab('code'), makeTab('issues')]);
	addTab(makeTab('bugs'));
	expect(get(tabs).map(tab => tab.id)).toEqual(['code', 'issues', 'bugs']);
});

it('inserts a tab before a matching native tab', async () => {
	const {tabs, setNativeTabs, addTab} = await loadModule();
	setNativeTabs([makeTab('code'), makeTab('issues')]);
	addTab(makeTab('bugs'), 'issues');
	expect(get(tabs).map(tab => tab.id)).toEqual(['code', 'bugs', 'issues']);
});

it('appends a tab when "before" does not match any tab', async () => {
	const {tabs, setNativeTabs, addTab} = await loadModule();
	setNativeTabs([makeTab('code'), makeTab('issues')]);
	addTab(makeTab('bugs'), 'nonexistent');
	expect(get(tabs).map(tab => tab.id)).toEqual(['code', 'issues', 'bugs']);
});

it('inserts multiple extra tabs before the same native tab in call order', async () => {
	const {tabs, setNativeTabs, addTab} = await loadModule();
	setNativeTabs([makeTab('code'), makeTab('issues')]);
	addTab(makeTab('bugs'), 'issues');
	addTab(makeTab('triage'), 'issues');
	expect(get(tabs).map(tab => tab.id)).toEqual(['code', 'bugs', 'triage', 'issues']);
});

it('hides a native tab', async () => {
	const {tabs, setNativeTabs, hideTab} = await loadModule();
	setNativeTabs([makeTab('code'), makeTab('issues')]);
	hideTab('issues');
	expect(get(tabs).map(tab => tab.id)).toEqual(['code']);
});

it('does not hide extra tabs (only filters native tabs by id)', async () => {
	const {tabs, setNativeTabs, addTab, hideTab} = await loadModule();
	setNativeTabs([makeTab('code')]);
	addTab(makeTab('bugs'));
	hideTab('bugs');
	expect(get(tabs).map(tab => tab.id)).toEqual(['code', 'bugs']);
});

it('replacing native tabs does not drop extra tabs', async () => {
	const {tabs, setNativeTabs, addTab} = await loadModule();
	setNativeTabs([makeTab('code'), makeTab('issues')]);
	addTab(makeTab('bugs'), 'issues');
	setNativeTabs([makeTab('code'), makeTab('issues'), makeTab('actions')]);
	expect(get(tabs).map(tab => tab.id)).toEqual(['code', 'bugs', 'issues', 'actions']);
});

it('tracks the selected tab id', async () => {
	const {selectedId, selectTab} = await loadModule();
	expect(get(selectedId)).toBeUndefined();
	selectTab('issues');
	expect(get(selectedId)).toBe('issues');
});
