import test from 'ava';
import Window from './fixtures/window';

global.window = new Window();
global.location = window.location;
require('../extension/page-detect.js');
const {pageDetect} = window;

const urisMatch = (t, fn, testURIs = []) => {
	for (const uri of testURIs) {
		location.href = uri;
		t.true(fn());
	}
};

test('isGist', t => {
	urisMatch(t, pageDetect.isGist, [
		'https://gist.github.com',
		'http://gist.github.com',
		'https://gist.github.com/sindresorhus/0ea3c2845718a0a0f0beb579ff14f064'
	]);
});

test('isDashboard', t => {
	urisMatch(t, pageDetect.isDashboard, [
		'https://github.com/',
		'https://github.com/orgs/test/dashboard'
	]);
});

test('isRepo', t => {
	urisMatch(t, pageDetect.isRepo, [
		'http://github.com/sindresorhus/refined-github',
		'https://github.com/sindresorhus/refined-github/issues/146',
		'https://github.com/sindresorhus/refined-github/pull/145'
	]);
});

test.todo('getRepoPath');
test.todo('isRepoRoot');

test('isIssueList', t => {
	urisMatch(t, pageDetect.isIssueList, [
		'http://github.com/sindresorhus/ava/issues'
	]);
});

test('isIssue', t => {
	urisMatch(t, pageDetect.isIssue, [
		'https://github.com/sindresorhus/refined-github/issues/146'
	]);
});

test('isPRList', t => {
	urisMatch(t, pageDetect.isPRList, [
		'https://github.com/sindresorhus/refined-github/pulls'
	]);
});

test('isPR', t => {
	urisMatch(t, pageDetect.isPR, [
		'https://github.com/sindresorhus/refined-github/pull/148'
	]);
});

test('isPRFiles', t => {
	urisMatch(t, pageDetect.isPRFiles, [
		'https://github.com/sindresorhus/refined-github/pull/148/files'
	]);
});

test('isPRCommit', t => {
	urisMatch(t, pageDetect.isPRCommit, [
		'https://github.com/sindresorhus/refined-github/pull/148/commits/0019603b83bd97c2f7ef240969f49e6126c5ec85'
	]);
});

test('isCommitList', t => {
	urisMatch(t, pageDetect.isCommitList, [
		'https://github.com/sindresorhus/refined-github/commits/master'
	]);
});

test('isSingleCommit', t => {
	urisMatch(t, pageDetect.isSingleCommit, [
		'https://github.com/sindresorhus/refined-github/commit/5b614b9035f2035b839f48b4db7bd5c3298d526f'
	]);
});

test.todo('isCommit');

test('isReleases', t => {
	urisMatch(t, pageDetect.isReleases, [
		'https://github.com/sindresorhus/refined-github/releases'
	]);
});

test('isBlame', t => {
	urisMatch(t, pageDetect.isBlame, [
		'https://github.com/sindresorhus/refined-github/blame/master/package.json'
	]);
});
