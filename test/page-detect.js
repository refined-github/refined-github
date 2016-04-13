import test from 'ava';
import Window from './fixtures/window';

global.window = new Window();
global.location = window.location;
require('../extension/page-detect.js');
const {pageDetect} = window;

const uriBulkTest = (shouldMatch, t, fn, testURIs = []) => {
	for (const uri of testURIs) {
		location.href = uri;
		t[shouldMatch ? 'true' : 'false'](fn());
	}
};
const urisMatch = (...args) => uriBulkTest(true, ...args);
const urisDontMatch = (...args) => uriBulkTest(false, ...args);

test('isGist', t => {
	urisMatch(t, pageDetect.isGist, [
		'https://gist.github.com',
		'http://gist.github.com',
		'https://gist.github.com/sindresorhus/0ea3c2845718a0a0f0beb579ff14f064'
	]);

	urisDontMatch(t, pageDetect.isGist, [
		'https://github.com',
		'https://help.github.com/'
	]);
});

test('isDashboard', t => {
	urisMatch(t, pageDetect.isDashboard, [
		'https://github.com/',
		'https://github.com/orgs/test/dashboard'
	]);

	urisDontMatch(t, pageDetect.isDashboard, [
		'https://github.com/sindresorhus'
	]);
});

test('isRepo', t => {
	urisMatch(t, pageDetect.isRepo, [
		'http://github.com/sindresorhus/refined-github',
		'https://github.com/sindresorhus/refined-github/issues/146',
		'https://github.com/sindresorhus/refined-github/pull/145'
	]);

	urisDontMatch(t, pageDetect.isRepo, [
		'https://github.com/sindresorhus',
		'https://github.com',
		'https://github.com/stars'
	]);
});

test('isIssueList', t => {
	urisMatch(t, pageDetect.isIssueList, [
		'http://github.com/sindresorhus/ava/issues'
	]);

	urisDontMatch(t, pageDetect.isIssueList, [
		'http://github.com/sindresorhus/ava',
		'https://github.com',
		'https://github.com/sindresorhus/refined-github/issues/170'
	]);
});

test('isIssue', t => {
	urisMatch(t, pageDetect.isIssue, [
		'https://github.com/sindresorhus/refined-github/issues/146'
	]);

	urisDontMatch(t, pageDetect.isIssue, [
		'http://github.com/sindresorhus/ava',
		'https://github.com',
		'https://github.com/sindresorhus/refined-github/issues'
	]);
});

test('isPRList', t => {
	urisMatch(t, pageDetect.isPRList, [
		'https://github.com/sindresorhus/refined-github/pulls'
	]);

	urisDontMatch(t, pageDetect.isPRList, [
		'http://github.com/sindresorhus/ava',
		'https://github.com',
		'https://github.com/sindresorhus/refined-github/pull/148'
	]);
});

test('isPR', t => {
	urisMatch(t, pageDetect.isPR, [
		'https://github.com/sindresorhus/refined-github/pull/148'
	]);

	urisDontMatch(t, pageDetect.isPR, [
		'http://github.com/sindresorhus/ava',
		'https://github.com',
		'https://github.com/sindresorhus/refined-github/pulls'
	]);
});

test('isPRFiles', t => {
	urisMatch(t, pageDetect.isPRFiles, [
		'https://github.com/sindresorhus/refined-github/pull/148/files'
	]);

	urisDontMatch(t, pageDetect.isPRFiles, [
		'https://github.com/sindresorhus/refined-github/pull/148',
		'https://github.com/sindresorhus/refined-github/pull/commits',
		'https://github.com/sindresorhus/refined-github/pulls'
	]);
});

test('isPRCommit', t => {
	urisMatch(t, pageDetect.isPRCommit, [
		'https://github.com/sindresorhus/refined-github/pull/148/commits/0019603b83bd97c2f7ef240969f49e6126c5ec85'
	]);

	urisDontMatch(t, pageDetect.isPRCommit, [
		'https://github.com/sindresorhus/refined-github/pull/148',
		'https://github.com/sindresorhus/refined-github/pull/commits',
		'https://github.com/sindresorhus/refined-github/pulls'
	]);
});

test('isCommitList', t => {
	urisMatch(t, pageDetect.isCommitList, [
		'https://github.com/sindresorhus/refined-github/commits/master?page=2',
		'https://github.com/sindresorhus/refined-github/commits/test-branch',
		'https://github.com/sindresorhus/refined-github/commits/0.13.0'
	]);

	urisDontMatch(t, pageDetect.isCommitList, [
		'https://github.com/sindresorhus/refined-github/pull/148',
		'https://github.com/sindresorhus/refined-github/pull/commits',
		'https://github.com/sindresorhus/refined-github/branches'
	]);
});

test('isSingleCommit', t => {
	urisMatch(t, pageDetect.isSingleCommit, [
		'https://github.com/sindresorhus/refined-github/commit/5b614b9035f2035b839f48b4db7bd5c3298d526f'
	]);

	urisDontMatch(t, pageDetect.isSingleCommit, [
		'https://github.com/sindresorhus/refined-github/pull/148/commits',
		'https://github.com/sindresorhus/refined-github/branches'
	]);
});

test('isReleases', t => {
	urisMatch(t, pageDetect.isReleases, [
		'https://github.com/sindresorhus/refined-github/releases'
	]);

	urisDontMatch(t, pageDetect.isReleases, [
		'https://github.com/sindresorhus/refined-github',
		'https://github.com/sindresorhus/refined-github/graphs'
	]);
});

test('isBlame', t => {
	urisMatch(t, pageDetect.isBlame, [
		'https://github.com/sindresorhus/refined-github/blame/master/package.json'
	]);

	urisDontMatch(t, pageDetect.isBlame, [
		'https://github.com/sindresorhus/refined-github/blob/master/package.json'
	]);
});
