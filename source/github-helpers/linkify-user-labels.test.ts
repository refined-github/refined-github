import {readFileSync} from 'node:fs';
import {$, $$, $$optional} from 'select-dom';
import {assert, beforeEach, test, vi} from 'vitest';

const {registration} = vi.hoisted(() => ({
	registration: {
		selector: '',
		callback(_label: HTMLElement): void {
			throw new Error('Observer not registered');
		},
		init(_signal: AbortSignal): void {
			throw new Error('Feature not registered');
		},
	},
}));

vi.mock('../feature-manager.js', () => ({
	default: {
		add(_url: string, config: {init: (signal: AbortSignal) => void}) {
			registration.init = config.init;
		},
	},
}));
vi.mock('../helpers/selector-observer.js', () => ({
	default(selectors: string[], callback: (label: HTMLElement) => void) {
		registration.selector = selectors.join(',');
		registration.callback = callback;
	},
}));

await import('../features/linkify-user-labels.js');

const fixture = readFileSync('source/github-helpers/fixtures/author-association.html', 'utf8');

beforeEach(() => {
	location.assign('https://github.com/refined-github/sandbox/pull/1');
	document.body.innerHTML = fixture;
	registration.init(new AbortController().signal);
});

// Simulate selector-observer callbacks, but use real repository/author helpers and DOM wrapping.
function deliver(): void {
	for (const label of $$optional(registration.selector)) {
		registration.callback(label);
	}
}

test('normalized own Contributor and other Collaborator badges link to their authors', () => {
	deliver();
	const own = $('#own-contributor a');
	assert.equal(own.href, 'https://github.com/refined-github/sandbox/commits?author=octocat');
	assert.equal(own.textContent.trim(), 'Contributor');
	assert.equal($('#other-collaborator a').href, 'https://github.com/refined-github/sandbox/commits?author=other-user');
	assert.equal(
		$('#own-contributor .tooltipped').getAttribute('aria-label'),
		'You have previously committed to the sandbox repository.',
	);
});

test('repeated callbacks and synthetic React replacement do not duplicate or nest links', () => {
	deliver();
	deliver();
	assert.lengthOf($$('a.rgh-linkify-user-labels'), 2);
	assert.lengthOf($$optional('a a'), 0);
	const replacement = $('#own-contributor .tooltipped').cloneNode(true);
	$('#own-contributor .timeline-comment-header').append(replacement);
	deliver();
	assert.lengthOf($$('#own-contributor a'), 1);
	assert.lengthOf($$('#own-contributor .tooltipped'), 1);
	assert.equal($('#own-contributor a').href, 'https://github.com/refined-github/sandbox/commits?author=octocat');
});

test('already-linked badges are preserved without errors', () => {
	const label = $('#own-contributor .tooltipped');
	const link = document.createElement('a');
	link.href = '/existing-destination';
	label.before(link);
	link.append(label);
	deliver();
	assert.equal($('#own-contributor a'), link);
	assert.equal(link.getAttribute('href'), '/existing-destination');
	assert.lengthOf($$optional('#own-contributor a a'), 0);
});

test.each([
	['This user is a member of the example organization.', 'Member'],
	['This user has previously committed to the sandbox repository.', 'Contributor'],
])('synthetic regression for existing wording: %s', (tooltip, text) => {
	const label = $('#own-contributor .tooltipped');
	label.setAttribute('aria-label', tooltip);
	label.textContent = text;
	deliver();
	assert.equal($('#own-contributor a').href, 'https://github.com/refined-github/sandbox/commits?author=octocat');
});

test.each([
	'You are a member of the example organization.',
	'You have been invited to collaborate on the sandbox repository.',
	'This user is the owner of the sandbox repository.',
	'This user is a maintainer of the sandbox repository.',
	'',
])('synthetic unsupported association wording is not inferred: %s', tooltip => {
	$('#own-contributor .tooltipped').setAttribute('aria-label', tooltip);
	deliver();
	assert.lengthOf($$optional('#own-contributor a'), 0);
});

test('synthetic React issue association uses the same confirmed wording', () => {
	const label = $('#own-contributor .tooltipped');
	label.className = '';
	label.setAttribute('data-testid', 'comment-author-association');
	deliver();
	assert.equal($('#own-contributor a').href, 'https://github.com/refined-github/sandbox/commits?author=octocat');
});

test('synthetic legacy PR-list badge preserves author-query extraction', () => {
	document.body.innerHTML =
		'<div class="opened-by"><a data-hovercard-type="user" href="/refined-github/sandbox/pulls?q=author%3Aother-user">other-user</a><span class="tooltipped" aria-label="This user has been invited to collaborate on the sandbox repository."><span class="Label">Collaborator</span></span></div>';
	deliver();
	assert.equal(
		$('a.rgh-linkify-user-labels').href,
		'https://github.com/refined-github/sandbox/commits?author=other-user',
	);
});
