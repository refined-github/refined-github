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

it('replaces and removes an extra tab without duplicating it', async () => {
	const {tabs, selectedId, setNativeTabs, addTab, removeTab, selectTab} = await loadModule();
	setNativeTabs([makeTab('code'), makeTab('actions')]);
	addTab(makeTab('queue', {href: '/queue/main'}), 'actions');
	addTab(makeTab('queue', {href: '/queue/stable'}), 'actions');
	expect(get(tabs).map(tab => tab.id)).toEqual(['code', 'queue', 'actions']);
	expect(get(tabs)[1].href).toBe('/queue/stable');
	selectTab('queue');
	removeTab('queue');
	expect(get(tabs).map(tab => tab.id)).toEqual(['code', 'actions']);
	expect(get(selectedId)).toBeUndefined();
	addTab(makeTab('queue', {href: '/queue/stable'}), 'actions');
	expect(get(tabs).map(tab => tab.id)).toEqual(['code', 'queue', 'actions']);
});

it('overrides a native tab label', async () => {
	const {tabs, setNativeTabs, overrideTab} = await loadModule();
	setNativeTabs([makeTab('security-and-quality', {label: 'Security and quality'})]);
	overrideTab('security-and-quality', {label: 'Security'});
	expect(get(tabs)[0].label).toBe('Security');
});

it('merges multiple overrides for the same tab', async () => {
	const {tabs, setNativeTabs, overrideTab} = await loadModule();
	setNativeTabs([makeTab('agents')]);
	overrideTab('agents', {label: 'AI agents'});
	overrideTab('agents', {demoted: true});
	expect(get(tabs)[0]).toMatchObject({label: 'AI agents', demoted: true});
});

it('moves demoted native tabs to the end, preserving relative order', async () => {
	const {tabs, setNativeTabs, overrideTab} = await loadModule();
	setNativeTabs([makeTab('code'), makeTab('projects'), makeTab('issues'), makeTab('insights')]);
	overrideTab('projects', {demoted: true});
	overrideTab('insights', {demoted: true});
	expect(get(tabs).map(tab => tab.id)).toEqual(['code', 'issues', 'projects', 'insights']);
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
