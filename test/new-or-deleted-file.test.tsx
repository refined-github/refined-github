import {$, $optional} from 'select-dom';
import {assert, beforeEach, describe, test, vi} from 'vitest';

const {observe} = vi.hoisted(() => ({
	observe: vi.fn(),
}));

vi.mock('../source/feature-manager.js', () => ({
	default: {
		add: vi.fn((_url: string, loader: {init: (signal: AbortSignal) => unknown}) =>
			loader.init(new AbortController().signal)
		),
		unload: vi.fn(),
	},
}));

vi.mock('../source/helpers/selector-observer.js', () => ({
	default: observe,
}));

await import('../source/features/new-or-deleted-file.js');

const maybeAddIcon = observe.mock.calls
	.find(([selector]) => selector === 'div[class*="file-path-section"]')![1] as (fileHeader: HTMLDivElement) => void;

function createFileHeader(iconClass: string): HTMLDivElement {
	document.body.innerHTML = `
		<ul aria-label="File Tree">
			<li class="file-tree-row-test">
				<a href="#diff-test">file.ts</a>
				<svg class="${iconClass}"></svg>
			</li>
		</ul>
		<div id="file-header"><a href="#diff-test">file.ts</a></div>
	`;

	return $('#file-header');
}

describe('maybeAddIcon', () => {
	beforeEach(() => {
		document.body.replaceChildren();
	});

	test('does not add the redundant renamed-file icon', () => {
		const fileHeader = createFileHeader('octicon-file-moved');

		maybeAddIcon(fileHeader);

		assert.notExists($optional('svg', fileHeader));
	});

	test('still adds status icons not already shown in the header', () => {
		const fileHeader = createFileHeader('octicon-file-added');

		maybeAddIcon(fileHeader);

		assert.exists($optional('svg.octicon-file-added', fileHeader));
	});
});
