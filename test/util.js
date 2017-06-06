import test from 'ava';
import {getURLRegex, getIssueRegex} from '../src/libs/util';
import Window from './fixtures/window';

global.window = new Window();
global.location = window.location;

function batchTestText(t, getRegex, shouldMatch = [], shouldNotMatch = []) {
	for (const text of shouldMatch) {
		t.true(getRegex().test(text));
	}

	for (const text of shouldNotMatch) {
		t.false(getRegex().test(text));
	}
}

test('issueRegex', batchTestText, getIssueRegex, [
	'#1',
	'#12',
	'an issue in the middle #123 of some text' // Only link to issues in comments, see #381
], [
	'#a',
	'1234'
]);

test('URLRegex', batchTestText, getURLRegex, [
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
