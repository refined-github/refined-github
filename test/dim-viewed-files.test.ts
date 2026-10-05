import {afterEach, beforeEach, expect, it, vi} from 'vitest';

import {init} from '../source/features/dim-viewed-files.js';
import observe from '../source/helpers/selector-observer.js';

vi.mock('../source/feature-manager.js', () => ({default: {add: vi.fn()}}));
vi.mock('../source/helpers/selector-observer.js', () => ({default: vi.fn()}));

let controller: AbortController;

beforeEach(() => {
	controller = new AbortController();
	vi.mocked(observe).mockClear();
	document.body.innerHTML = `
		<ul aria-label="File Tree">
			<li class="file-tree-row"><a href="#diff-first">first.ts</a></li>
			<li class="file-tree-row"><a href="#diff-second">second.ts</a></li>
		</ul>
		<div class="Diff-module__diffTargetable" id="diff-first">
			<button class="MarkAsViewedButton"><svg class="octicon-checkbox-fill"></svg></button>
		</div>
		<div class="Diff-module__diffTargetable" id="diff-second">
			<button class="MarkAsViewedButton"><svg class="octicon-square"></svg></button>
		</div>
	`;
});

function setNestedTree(): void {
	document.querySelector('ul[aria-label="File Tree"]')!.outerHTML = `
		<ul aria-label="File Tree">
			<li id="folder-src" data-tree-entry-type="directory">
				<button>src</button>
				<ul>
					<li id="folder-components" data-tree-entry-type="directory">
						<button>components</button>
						<ul>
							<li data-tree-entry-type="file"><a href="#diff-first">first.ts</a></li>
						</ul>
					</li>
					<li data-tree-entry-type="file"><a href="#diff-second">second.ts</a></li>
				</ul>
			</li>
		</ul>
	`;
}

afterEach(() => {
	controller.abort();
	document.body.replaceChildren();
});

it('dims only files already marked as viewed', () => {
	init(controller.signal);
	expect(document.querySelectorAll('.rgh-dim-viewed-files')).toHaveLength(1);
	expect(document.querySelector('.rgh-dim-viewed-files')?.textContent).toBe('first.ts');
});

it('dims nested folders only when all descendant files are viewed', async () => {
	setNestedTree();
	init(controller.signal);
	expect(document.querySelector('#folder-components > button')?.classList.contains('rgh-dim-viewed-files')).toBe(true);
	expect(document.querySelector('#folder-src > button')?.classList.contains('rgh-dim-viewed-files')).toBe(false);

	document.querySelector('#diff-second button')!.innerHTML = '<svg class="octicon-checkbox-fill"></svg>';
	document.querySelector('#diff-second button')!.dispatchEvent(new MouseEvent('click', {bubbles: true}));
	await vi.waitFor(() => {
		expect(document.querySelector('#folder-src > button')?.classList.contains('rgh-dim-viewed-files')).toBe(true);
	});
});

it('dims folders in the React file tree without dimming their subtree', () => {
	document.querySelector('ul[aria-label="File Tree"]')!.outerHTML = `
		<ul role="tree" aria-label="File Tree">
			<li id="react-folder" role="treeitem" aria-expanded="true" class="PRIVATE_TreeView-item">
				<div class="PRIVATE_TreeView-item-container">
					<div class="PRIVATE_TreeView-item-toggle"></div>
					<div class="PRIVATE_TreeView-item-content">tests</div>
				</div>
				<ul role="group">
					<li role="treeitem" class="file-tree-row"><a href="#diff-first">first.ts</a></li>
				</ul>
			</li>
		</ul>
	`;
	init(controller.signal);
	const folder = document.querySelector('#react-folder')!;
	expect(folder.classList.contains('rgh-dim-viewed-files')).toBe(false);
	expect(folder.querySelector('.PRIVATE_TreeView-item-container')?.classList.contains('rgh-dim-viewed-files')).toBe(
		true,
	);
	expect(folder.querySelector('li')?.classList.contains('rgh-dim-viewed-files')).toBe(true);
});

it('keeps folders undimmed when a descendant file state is unknown', () => {
	document.querySelector('ul[aria-label="File Tree"]')!.innerHTML = `
		<li id="folder-unknown" data-tree-entry-type="directory">
			<button>unknown</button>
			<ul><li data-tree-entry-type="file"><a href="#diff-unknown">unknown.ts</a></li></ul>
		</li>
	`;
	init(controller.signal);
	expect(document.querySelector('#folder-unknown > button')?.classList.contains('rgh-dim-viewed-files')).toBe(false);
});

it('updates after viewed controls are clicked', async () => {
	init(controller.signal);
	document.querySelector('#diff-first button')!.replaceChildren();
	document.querySelector('#diff-second button')!.innerHTML = '<svg class="octicon-checkbox-fill"></svg>';
	document.querySelector('#diff-second button')!.dispatchEvent(new MouseEvent('click', {bubbles: true}));
	await vi.waitFor(() => {
		expect(document.querySelectorAll('.rgh-dim-viewed-files')).toHaveLength(1);
		expect(document.querySelector('.rgh-dim-viewed-files')?.textContent).toBe('second.ts');
	});
});

it('dims viewed files when the tree is rendered again', async () => {
	init(controller.signal);
	document.querySelector('ul')!.innerHTML = '<li class="file-tree-row"><a href="#diff-first">first.ts</a></li>';
	const [, update] = vi.mocked(observe).mock.calls[0]!;
	update(document.querySelector('a')!, {signal: controller.signal});
	await vi.waitFor(() => {
		expect(document.querySelector('li')?.classList.contains('rgh-dim-viewed-files')).toBe(true);
	});
});

it('supports legacy viewed checkboxes and restores unviewed files', async () => {
	document.querySelector('#diff-first')!.outerHTML = `
		<div class="js-file" id="diff-first">
			<input class="js-reviewed-checkbox" type="checkbox" checked>
		</div>
	`;
	init(controller.signal);
	expect(document.querySelector('.rgh-dim-viewed-files')?.textContent).toBe('first.ts');
	const checkbox = document.querySelector<HTMLInputElement>('input')!;
	checkbox.checked = false;
	checkbox.dispatchEvent(new Event('change', {bubbles: true}));
	await vi.waitFor(() => {
		expect(document.querySelector('.rgh-dim-viewed-files')).toBeNull();
	});
});

it('reads the current viewed state from aria-pressed', () => {
	document.querySelector('#diff-first button')!.replaceChildren();
	document.querySelector('#diff-first button')!.setAttribute('aria-pressed', 'true');
	init(controller.signal);
	expect(document.querySelector('.rgh-dim-viewed-files')?.textContent).toBe('first.ts');
});

it('removes dimming and ignores pending updates when unloaded', async () => {
	init(controller.signal);
	document.querySelector('#diff-second button')!.dispatchEvent(new MouseEvent('click', {bubbles: true}));
	controller.abort();
	expect(document.querySelector('.rgh-dim-viewed-files')).toBeNull();
	document.querySelector('#diff-second button')!.innerHTML = '<svg class="octicon-checkbox-fill"></svg>';
	await new Promise<void>(resolve => {
		requestAnimationFrame(() => {
			resolve();
		});
	});
	expect(document.querySelector('.rgh-dim-viewed-files')).toBeNull();
});
