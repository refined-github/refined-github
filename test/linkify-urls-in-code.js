import test from 'ava';
import Window from './fixtures/window';

global.window = new Window();
global.location = window.location;

require('../extension/linkify-urls-in-code.js'); // eslint-disable-line import/no-unassigned-import

const {linkifyURLsInCode} = window;

function batchTestText(t, detectFn, shouldMatch = [], shouldNotMatch = []) {
	for (const text of shouldMatch) {
		t.true(detectFn(text));
	}

	for (const text of shouldNotMatch) {
		t.false(detectFn(text));
	}
}

test('isIssue', batchTestText, linkifyURLsInCode.hasIssue, [
	'#1',
	'#12',
	'an issue in the middle #123 of some text'
], [
	'#a',
	'1234'
]);

test('isIssueInComment', batchTestText, linkifyURLsInCode.hasCommentClass, [
	'Whatever <span class="pl-c">some/repo#1</span>',
	'<span class="pl-c">#123</span>'
], [
	'<span class="pl-v">#123</span>'
]);

test('isURL', batchTestText, linkifyURLsInCode.hasURL, [
	'http://github.com/',
	'https://www.github.com',
	'https://github.com/orgs/test/dashboard',
	'a long string of text with a url at the end: https://github.com/dashboard?param=test'
], [
	'https://github',
	'github',
	'github.com',
	'github/whatever/text'
]);
