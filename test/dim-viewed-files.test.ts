import {readFileSync} from 'node:fs';
import {$, $$optional, $optional} from 'select-dom';
import {afterEach, beforeEach, expect, it, vi} from 'vitest';

import {init} from '../source/features/dim-viewed-files.js';
import observe from '../source/helpers/selector-observer.js';

vi.mock('../source/feature-manager.js', () => ({default: {add: vi.fn()}}));
vi.mock('../source/helpers/selector-observer.js', () => ({default: vi.fn()}));

let controller: AbortController;

// The selectors of the feature's CSS rules, so dimming can be tested without a layout engine
const css = readFileSync('source/features/dim-viewed-files.css', 'utf8').replaceAll(/\/\*.*?\*\//gsv, '');
const dimmedSelector = css
	// Flatten one level of nesting: `parent { &child {…} }` becomes `:is(parent)child`
	.matchAll(/(?<parent>[^\{\}]+)\{(?<body>[^\{\}]*(?:\{[^\{\}]*\}[^\{\}]*)?)\}/gv)
	.map(({groups}) => {
		const {parent, body} = groups!;
		return body.includes('{') ? `:is(${parent})${body.slice(body.indexOf('&') + 1, body.indexOf('{'))}` : parent;
	})
	.toArray()
	.join(',')
	// The test DOM's selector parser doesn't accept whitespace inside parentheses
	.replaceAll(/\s+/gv, ' ')
	.replaceAll('( ', '(')
	.replaceAll(' )', ')');

function isDimmed(selector: string): boolean {
	return $(selector).matches(dimmedSelector);
}

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
	$('ul[aria-label="File Tree"]').outerHTML = `
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
	expect($$optional('.rgh-dim-viewed-files')).toHaveLength(1);
	expect($optional('.rgh-dim-viewed-files')?.textContent).toBe('first.ts');
});

it('dims nested folders only when all descendant files are viewed', () => {
	setNestedTree();
	init(controller.signal);
	expect(isDimmed('#folder-components > button')).toBe(true);
	expect(isDimmed('#folder-src > button')).toBe(false);
	expect(isDimmed('#folder-src > ul')).toBe(false);
});

// Separate test because happy-dom caches `:has()` results across descendant changes
it('dims parent folders once their remaining files are viewed', async () => {
	setNestedTree();
	init(controller.signal);
	$('#diff-second button').innerHTML = '<svg class="octicon-checkbox-fill"></svg>';
	$('#diff-second button').dispatchEvent(new MouseEvent('click', {bubbles: true}));
	await vi.waitFor(() => {
		expect($$optional('li.rgh-dim-viewed-files')).toHaveLength(2);
	});
	expect(isDimmed('#folder-src > button')).toBe(true);
});

it('dims folders in the React file tree without dimming their subtree', () => {
	$('ul[aria-label="File Tree"]').outerHTML = `
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
	expect(isDimmed('#react-folder')).toBe(false);
	expect(isDimmed('#react-folder > ul')).toBe(false);
	expect(isDimmed('#react-folder .PRIVATE_TreeView-item-container')).toBe(true);
	expect(isDimmed('#react-folder li')).toBe(true);
});

it('keeps folders undimmed when a descendant file state is unknown', () => {
	$('ul[aria-label="File Tree"]').innerHTML = `
		<li id="folder-unknown" data-tree-entry-type="directory">
			<button>unknown</button>
			<ul><li data-tree-entry-type="file"><a href="#diff-unknown">unknown.ts</a></li></ul>
		</li>
	`;
	init(controller.signal);
	expect(isDimmed('#folder-unknown > button')).toBe(false);
});

it('updates after viewed controls are clicked', async () => {
	init(controller.signal);
	$('#diff-first button').replaceChildren();
	$('#diff-second button').innerHTML = '<svg class="octicon-checkbox-fill"></svg>';
	$('#diff-second button').dispatchEvent(new MouseEvent('click', {bubbles: true}));
	await vi.waitFor(() => {
		expect($$optional('.rgh-dim-viewed-files')).toHaveLength(1);
		expect($optional('.rgh-dim-viewed-files')?.textContent).toBe('second.ts');
	});
});

it('dims viewed files when the tree is rendered again', async () => {
	init(controller.signal);
	$('ul').innerHTML = '<li class="file-tree-row"><a href="#diff-first">first.ts</a></li>';
	const [, update] = vi.mocked(observe).mock.calls[0];
	update($('a'), {signal: controller.signal});
	await vi.waitFor(() => {
		expect($optional('li')?.classList.contains('rgh-dim-viewed-files')).toBe(true);
	});
});

it('dims files whose viewed state loads after rendering', async () => {
	init(controller.signal);
	const button = $('#diff-second button');
	button.setAttribute('aria-pressed', 'true');
	const [selectors, update] = vi.mocked(observe).mock.calls[0];
	expect([selectors].flat().some(selector => button.matches(selector))).toBe(true);
	update(button, {signal: controller.signal});
	await vi.waitFor(() => {
		expect($$optional('.rgh-dim-viewed-files')).toHaveLength(2);
	});
});

it('supports legacy viewed checkboxes and restores unviewed files', async () => {
	$('#diff-first').outerHTML = `
		<div class="js-file" id="diff-first">
			<input class="js-reviewed-checkbox" type="checkbox" checked>
		</div>
	`;
	init(controller.signal);
	expect($optional('.rgh-dim-viewed-files')?.textContent).toBe('first.ts');
	const checkbox = $<HTMLInputElement>('input');
	checkbox.checked = false;
	checkbox.dispatchEvent(new Event('change', {bubbles: true}));
	await vi.waitFor(() => {
		expect($optional('.rgh-dim-viewed-files')).toBeUndefined();
	});
});

it('reads the current viewed state from aria-pressed', () => {
	$('#diff-first button').replaceChildren();
	$('#diff-first button').setAttribute('aria-pressed', 'true');
	init(controller.signal);
	expect($optional('.rgh-dim-viewed-files')?.textContent).toBe('first.ts');
});

it('removes dimming and ignores pending updates when unloaded', async () => {
	init(controller.signal);
	$('#diff-second button').dispatchEvent(new MouseEvent('click', {bubbles: true}));
	controller.abort();
	expect($optional('.rgh-dim-viewed-files')).toBeUndefined();
	$('#diff-second button').innerHTML = '<svg class="octicon-checkbox-fill"></svg>';
	await new Promise<void>(resolve => {
		requestAnimationFrame(() => {
			resolve();
		});
	});
	expect($optional('.rgh-dim-viewed-files')).toBeUndefined();
});
