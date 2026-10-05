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

afterEach(() => {
	controller.abort();
	document.body.replaceChildren();
});

it('dims only files already marked as viewed', () => {
	init(controller.signal);
	expect(document.querySelectorAll('.rgh-dim-viewed-files')).toHaveLength(1);
	expect(document.querySelector('.rgh-dim-viewed-files')?.textContent).toBe('first.ts');
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
