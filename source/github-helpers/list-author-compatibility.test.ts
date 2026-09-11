import {readFileSync} from 'node:fs';
import {$, $$, $$optional, $optional} from 'select-dom';
import {afterEach, assert, beforeEach, test, vi} from 'vitest';

const {registrations, observers} = vi.hoisted(() => ({
	registrations: new Map<string, Array<{init: (signal: AbortSignal) => void}>>(),
	observers: [] as Array<{selector: string; callback: (element: HTMLElement) => void}>,
}));

vi.mock('../feature-manager.js', () => ({
	default: {
		add(url: string, ...config: Array<{init: (signal: AbortSignal) => void}>) {
			registrations.set(url.split('/').pop()!, config);
		},
	},
}));
vi.mock(
	'../helpers/selector-observer.js',
	() => ({
		default(selectors: string | string[], callback: (element: HTMLElement) => void) {
			observers.push({selector: String(selectors), callback});
		},
	}),
);
vi.mock('./index.js', () => ({getLoggedInUser: () => 'octocat', cacheByRepo: () => ''}));
vi.mock('./api.js', () => ({default: {}}));
// Vite adds ?import to non-JS imports; mock that request without changing Vite config.
vi.mock('../features/conversation-authors.gql?import', () => ({default: ''}));
vi.mock('webext-storage-cache', () => ({
	// eslint-disable-next-line @typescript-eslint/naming-convention
	CachedFunction: vi.fn(),
}));
vi.mock('../helpers/onetime.js', () => ({default: (callback: unknown) => callback}));

await import('../features/conversation-authors.js');
await import('../features/small-user-avatars.js');

const fixture = readFileSync('source/github-helpers/fixtures/list-authors.html', 'utf8');
let controller: AbortController;

// Simulate selector-observer delivery. Happy DOM does not run CSS animations.
function deliver(): void {
	for (const {selector, callback} of observers) {
		for (const element of $$optional(selector)) {
			callback(element);
		}
	}
}

beforeEach(() => {
	document.body.innerHTML = fixture;
	observers.length = 0;
	controller = new AbortController();
	registrations.get('conversation-authors.tsx')![1].init(controller.signal);
	registrations.get('small-user-avatars.tsx')![0].init(controller.signal);
	deliver();
});

afterEach(() => {
	controller.abort();
	document.body.replaceChildren();
});

test('self highlighting and human avatars preserve legacy and observed lists', () => {
	assert.lengthOf($$('.rgh-own-conversation'), 5);
	assert.lengthOf($$('img.rgh-small-user-avatars'), 5);
	for (const selector of ['#bot-pr img', '#assignee img', '#inbox img']) {
		assert.isUndefined($optional(selector));
	}

	const author = $('#global-issue button');
	assert.include(author.textContent, 'Filter by author octocat');
	assert.equal($('img', author).alt, '');
});

test('legacy title highlighting and nested username avatars are preserved', () => {
	const author = $('#legacy .opened-by a');
	author.innerHTML = '<span>octocat</span>';
	deliver();
	assert.isTrue(author.classList.contains('rgh-own-conversation'));
	assert.lengthOf($$('img', author), 1);
	assert.include($('img', author).src, '/octocat.png');
});

test('existing closed-issue, notification subscription and mention avatars are preserved', () => {
	document.body.insertAdjacentHTML(
		'beforeend',
		`
		<div data-testid="closed-at"><a data-hovercard-url="/users/other-user/hovercard">other-user</a></div>
		<div class="notification-thread-subscription"><a data-hovercard-type="user">other-user</a></div>
		<a class="user-mention" href="/other-user">@other-user</a>
		`,
	);
	deliver();
	assert.lengthOf($$('[data-testid="closed-at"] img'), 1);
	assert.lengthOf($$('.notification-thread-subscription img'), 1);
	assert.isTrue($('.user-mention').classList.contains('rgh-mention-avatar'));
	assert.include($('.user-mention').style.getPropertyValue('--avatar-url'), '/other-user.png');
});

test('repeated callbacks do not duplicate avatars; filter controls are preserved', () => {
	const button = $<HTMLButtonElement>('#global-pr [data-testid="author-filter-link"]');
	const click = vi.fn();
	button.addEventListener('click', click);
	const link = $('#preview-pr [data-testid="author-filter-link"]');
	const href = link.getAttribute('href');
	deliver();
	button.click();
	assert.equal(click.mock.calls.length, 1);
	assert.equal(link.getAttribute('href'), href);
	assert.lengthOf($$('img.rgh-small-user-avatars'), 5);
});

test('synthetic React-style replacement and reused author nodes', async () => {
	const author = $<HTMLButtonElement>('#global-pr [data-testid="author-filter-link"]');
	author.textContent = 'other-user';
	await vi.waitFor(() => {
		assert.isFalse(author.classList.contains('rgh-own-conversation'));
		assert.include($('img', author).src, '/other-user.png');
	});
	author.replaceChildren('octocat');
	await vi.waitFor(() => {
		assert.isTrue(author.classList.contains('rgh-own-conversation'));
		assert.lengthOf($$('img', author), 1);
	});
	const replacement = author.cloneNode(true) as HTMLElement;
	replacement.replaceChildren('other-user');
	author.replaceWith(replacement);
	deliver();
	assert.isFalse(replacement.classList.contains('rgh-own-conversation'));
	assert.lengthOf($$('img', replacement), 1);
});

test('synthetic identity edge cases ignore hidden/injected text and reject malformed data', async () => {
	const author = $('#global-issue button');
	author.innerHTML =
		'<span>Localized accessibility text</span>octocat<span class="rgh-name"> (A Name)</span><img alt="other-user">';
	author.removeAttribute('data-hovercard-url');
	await vi.waitFor(() => {
		assert.isTrue(author.classList.contains('rgh-own-conversation'));
		assert.include($('img.rgh-small-user-avatars', author).src, '/octocat.png');
	});
	author.setAttribute('data-hovercard-url', '/users/other-user/hovercard');
	await vi.waitFor(() => {
		assert.isFalse(author.classList.contains('rgh-own-conversation'));
		assert.include($('img.rgh-small-user-avatars', author).src, '/other-user.png');
	});
	author.setAttribute('data-hovercard-url', '/apps/dependabot/hovercard');
	await vi.waitFor(() => {
		assert.isFalse(author.classList.contains('rgh-own-conversation'));
		assert.isUndefined($optional('img.rgh-small-user-avatars', author));
	});
	author.removeAttribute('data-hovercard-url');
	for (const text of ['', 'Filter by author octocat', 'example/project', 'a?b', 'a b', '../octocat']) {
		author.textContent = text;
		// Each mutation must settle before reusing the same author node.
		// eslint-disable-next-line no-await-in-loop
		await vi.waitFor(() => {
			assert.isFalse(author.classList.contains('rgh-own-conversation'));
			assert.isUndefined($optional('img.rgh-small-user-avatars', author));
		});
	}
});

test('reused authors exclude bots and app links from human avatars', async () => {
	const author = $('#bot-pr [data-testid="author-filter-link"]');
	assert.isUndefined($optional('img', author));
	author.textContent = 'other-user';
	await vi.waitFor(() => {
		assert.lengthOf($$('img', author), 1);
	});
	author.textContent = 'dependabot[bot]';
	await vi.waitFor(() => {
		assert.isUndefined($optional('img', author));
	});
	author.textContent = 'dependabot';
	await vi.waitFor(() => {
		assert.lengthOf($$('img', author), 1);
	});
	author.setAttribute('href', '/apps/dependabot');
	await vi.waitFor(() => {
		assert.isUndefined($optional('img', author));
	});
	author.setAttribute('href', '/example/project/pulls?q=author%3Adependabot');
	await vi.waitFor(() => {
		assert.lengthOf($$('img', author), 1);
	});
	author.setAttribute('href', '/github-apps/dependabot');
	await vi.waitFor(() => {
		assert.isUndefined($optional('img', author));
	});
	author.setAttribute('href', '/example/project/pulls?q=author%3Adependabot');
	await vi.waitFor(() => {
		assert.lengthOf($$('img', author), 1);
	});
	author.setAttribute('data-hovercard-type', 'bot');
	await vi.waitFor(() => {
		assert.isUndefined($optional('img', author));
	});
});
