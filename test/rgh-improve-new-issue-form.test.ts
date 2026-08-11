import {$} from 'select-dom';
import {afterEach, beforeEach, expect, test, vi} from 'vitest';

const {featureAdd} = vi.hoisted(() => ({
	featureAdd: vi.fn(),
}));

vi.mock('../source/feature-manager.js', () => ({
	default: {add: featureAdd},
}));
vi.mock('../source/github-helpers/github-token.js', () => ({
	baseApiFetch: vi.fn(),
}));
vi.mock('../source/helpers/clear-cache-handler.js', () => ({
	default: vi.fn(),
}));
vi.mock('../source/helpers/extension-release-age.js', () => ({
	getExtensionReleaseDate: vi.fn(),
	toDaysAgo: vi.fn(),
	wasReleasedLongAgo: vi.fn(),
}));
vi.mock('../source/helpers/open-options.js', () => ({
	// eslint-disable-next-line @typescript-eslint/naming-convention -- Matches the named React component export
	OptionsLink: vi.fn(),
}));
vi.mock('../source/helpers/selector-observer.js', () => ({
	default: vi.fn(),
}));
vi.mock('../source/options-storage.js', () => ({
	getToken: vi.fn(),
}));

await import('../source/features/rgh-improve-new-issue-form.js');

type FeatureLoader = {
	init(signal: AbortSignal): void;
};

const registration = featureAdd.mock.calls.find(([url]) => String(url).includes('rgh-improve-new-issue-form'));
if (!registration) {
	throw new Error('Expected rgh-improve-new-issue-form to register');
}

const bypassModalLoader = registration[1] as FeatureLoader;
let controller: AbortController;

beforeEach(() => {
	location.assign('https://github.com/refined-github/refined-github');
	controller = new AbortController();
});

afterEach(() => {
	controller.abort();
	document.body.replaceChildren();
});

test.each([
	{
		name: 'list item',
		markup: '<li aria-keyshortcuts="n"><svg class="octicon-issue-opened"></svg></li>',
		selector: 'li',
	},
	{
		name: 'action button',
		markup: '<button class="GlobalCreateMenu-module__actionMenuButton_test">New issue</button>',
		selector: 'button',
	},
])('bypasses the new issue modal for an unmodified $name click', ({markup, selector}) => {
	document.body.innerHTML = markup;
	const newIssueAction = $(selector);
	const githubClickHandler = vi.fn();
	newIssueAction.addEventListener('click', githubClickHandler);
	bypassModalLoader.init(controller.signal);

	const click = new MouseEvent('click', {
		bubbles: true,
		cancelable: true,
	});
	expect(newIssueAction.dispatchEvent(click)).toBe(false);
	expect(click.defaultPrevented).toBe(true);
	expect(githubClickHandler).not.toHaveBeenCalled();
	expect(location.href).toBe('https://github.com/refined-github/refined-github/issues/new/choose');
});

test('preserves GitHub behavior for an altered click', () => {
	document.body.innerHTML = '<button class="GlobalCreateMenu-module__actionMenuButton_test">New issue</button>';
	const newIssueAction = $('button');
	const githubClickHandler = vi.fn();
	newIssueAction.addEventListener('click', githubClickHandler);
	bypassModalLoader.init(controller.signal);

	const click = new MouseEvent('click', {
		bubbles: true,
		cancelable: true,
		metaKey: true,
	});
	expect(newIssueAction.dispatchEvent(click)).toBe(true);
	expect(click.defaultPrevented).toBe(false);
	expect(githubClickHandler).toHaveBeenCalledOnce();
	expect(location.href).toBe('https://github.com/refined-github/refined-github');
});
