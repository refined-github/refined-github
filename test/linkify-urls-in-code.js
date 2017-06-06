import test from 'ava';
import {
	linkifyURL,
	linkifyIssueRef,
	linkifyURLsInElement,
	linkifyIssuesInElement
} from '../src/libs/linkify-urls-in-code';
import Window from './fixtures/window';

global.window = new Window();
global.location = window.location;
global.location.href = 'https://github.com/sindresorhus/refined-github/';

function runOnElement(html, ...transformFunctions) {
	const element = {
		innerHTML: html
	};
	for (const transform of transformFunctions) {
		transform(element);
	}
	return element.innerHTML;
}

function batchTestElement(t, transformFunction, pairs = []) {
	for (const [htmlInput, expected] of pairs) {
		t.is(runOnElement(htmlInput, transformFunction), expected);
	}
}

test('linkifyURL', t => {
	t.is(
		linkifyURL('https://github.com'),
		'<a href="https://github.com" target="_blank">https://github.com</a>'
	);
	t.is(
		linkifyURL('ftp://example.com/sub/folder'),
		'<a href="ftp://example.com/sub/folder" target="_blank">ftp://example.com/sub/folder</a>'
	);
	t.is(
		linkifyURL('/'),
		'<a href="/" target="_blank">/</a>'
	);
	t.is(
		linkifyURL('hello', 'Hello'),
		'<a href="hello" target="_blank">Hello</a>'
	);
	t.is(
		linkifyURL('>esc"me', '</a>escaped'),
		'<a href="&gt;esc&quot;me" target="_blank">&lt;/a&gt;escaped</a>'
	);
});

test('linkifyIssueRef', t => {
	t.is(
		linkifyIssueRef('#473'),
		`<a href="/sindresorhus/refined-github/issues/473" target="_blank">#473</a>`
	);
	t.is(
		linkifyIssueRef('someuser/other-repo#473'),
		`<a href="/someuser/other-repo/issues/473" target="_blank">someuser/other-repo#473</a>`
	);
});

test('linkifyURLsInElement', batchTestElement, linkifyURLsInElement, [
	[
		`<i class="random-element">ignoreme</i> https://github.com`,
		`<i class="random-element">ignoreme</i> ${linkifyURL('https://github.com')}`
	],
	[
		`inside other elements <i>https://github.com</i>`,
		`inside other elements <i>${linkifyURL('https://github.com')}</i>`
	],
	[
		`multiple similar urls like https://github.com/help and https://github.com`,
		`multiple similar urls like ${linkifyURL(`https://github.com/help`)} and ${linkifyURL(`https://github.com`)}`
	]
]);

test('linkifyIssuesInElement', batchTestElement, linkifyIssuesInElement, [
	[
		`<i class="random-element">ignoreme</i> #1 and stuff`,
		`<i class="random-element">ignoreme</i> ${linkifyIssueRef('#1')} and stuff`
	],
	[
		`inside other elements <i>#72</i>`,
		`inside other elements <i>${linkifyIssueRef('#72')}</i>`
	],
	[
		`multiple similar issues like #777 and #7`,
		`multiple similar issues like ${linkifyIssueRef(`#777`)} and ${linkifyIssueRef(`#7`)}`
	]
]);

test('linkifyAllInElement', t => {
	t.is(
		runOnElement('https://github.com #1 https://github.com', linkifyURLsInElement, linkifyIssuesInElement),
		`${linkifyURL('https://github.com')} ${linkifyIssueRef(`#1`)} ${linkifyURL('https://github.com')}`
	);
	t.is(
		runOnElement('<i>user/repo#13 </i>http://example.com/url #21 <https://git.io/url>', linkifyURLsInElement, linkifyIssuesInElement),
		`<i>${linkifyIssueRef(`user/repo#13`)} </i>${linkifyURL('http://example.com/url')} ${linkifyIssueRef(`#21`)} <${linkifyURL('https://git.io/url')}>`
	);
});
