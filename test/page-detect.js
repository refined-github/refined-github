import test from 'ava';
import Window from './fixtures/window';

global.window = new Window();
global.location = window.location;
require('../extension/page-detect.js');
const {pageDetect} = window;

const urlBulkTest = (shouldMatch, t, fn, testURLs = []) => {
	for (const url of testURLs) {
		location.href = url;
		t[shouldMatch ? 'true' : 'false'](fn());
	}
};
const urlsMatch = (...args) => urlBulkTest(true, ...args);
const urlsDontMatch = (...args) => urlBulkTest(false, ...args);

test('isGist', t => {
	urlsMatch(t, pageDetect.isGist, [
		'https://gist.github.com',
		'http://gist.github.com',
		'https://gist.github.com/sindresorhus/0ea3c2845718a0a0f0beb579ff14f064'
	]);

	urlsDontMatch(t, pageDetect.isGist, [
		'https://github.com',
		'https://help.github.com/'
	]);
});

test('isDashboard', t => {
	urlsMatch(t, pageDetect.isDashboard, [
		'https://github.com/',
		'https://github.com',
		'https://github.com/orgs/test/dashboard',
		'https://github.com/dashboard'
	]);

	urlsDontMatch(t, pageDetect.isDashboard, [
		'https://github.com/sindresorhus'
	]);
});

test('isRepo', t => {
	urlsMatch(t, pageDetect.isRepo, [
		'http://github.com/sindresorhus/refined-github',
		'https://github.com/sindresorhus/refined-github/issues/146',
		'https://github.com/sindresorhus/refined-github/pull/145'
	]);

	urlsDontMatch(t, pageDetect.isRepo, [
		'https://github.com/sindresorhus',
		'https://github.com',
		'https://github.com/stars'
	]);
});

test('isRepoTree', t => {
	urlsMatch(t, pageDetect.isRepoTree, [
		'https://github.com/sindresorhus/refined-github/tree/master/extension',
		'https://github.com/sindresorhus/refined-github/tree/0.13.0/extension',
		'https://github.com/sindresorhus/refined-github/tree/57bf435ee12d14b482df0bbd88013a2814c7512e/extension',
		'https://github.com/sindresorhus/refined-github/tree/57bf4'
	]);

	urlsDontMatch(t, pageDetect.isRepoTree, [
		'https://github.com/sindresorhus/refined-github/issues',
		'https://github.com/sindresorhus/refined-github'
	]);
});

test('isIssueSearch', t => {
	urlsMatch(t, pageDetect.isIssueSearch, [
		'https://github.com/issues'
	]);

	urlsDontMatch(t, pageDetect.isIssueSearch, [
		'https://github.com/sindresorhus/refined-github/issues',
		'https://github.com/sindresorhus/refined-github/issues/170'
	]);
});

test('isIssueList', t => {
	urlsMatch(t, pageDetect.isIssueList, [
		'http://github.com/sindresorhus/ava/issues'
	]);

	urlsDontMatch(t, pageDetect.isIssueList, [
		'http://github.com/sindresorhus/ava',
		'https://github.com',
		'https://github.com/sindresorhus/refined-github/issues/170'
	]);
});

test('isIssue', t => {
	urlsMatch(t, pageDetect.isIssue, [
		'https://github.com/sindresorhus/refined-github/issues/146'
	]);

	urlsDontMatch(t, pageDetect.isIssue, [
		'http://github.com/sindresorhus/ava',
		'https://github.com',
		'https://github.com/sindresorhus/refined-github/issues'
	]);
});

test('isPRSearch', t => {
	urlsMatch(t, pageDetect.isPRSearch, [
		'https://github.com/pulls'
	]);

	urlsDontMatch(t, pageDetect.isPRSearch, [
		'https://github.com/sindresorhus/refined-github/pulls',
		'https://github.com/sindresorhus/refined-github/pull/148'
	]);
});

test('isPRList', t => {
	urlsMatch(t, pageDetect.isPRList, [
		'https://github.com/sindresorhus/refined-github/pulls'
	]);

	urlsDontMatch(t, pageDetect.isPRList, [
		'http://github.com/sindresorhus/ava',
		'https://github.com',
		'https://github.com/sindresorhus/refined-github/pull/148'
	]);
});

test('isPR', t => {
	urlsMatch(t, pageDetect.isPR, [
		'https://github.com/sindresorhus/refined-github/pull/148'
	]);

	urlsDontMatch(t, pageDetect.isPR, [
		'http://github.com/sindresorhus/ava',
		'https://github.com',
		'https://github.com/sindresorhus/refined-github/pulls'
	]);
});

test('isPRFiles', t => {
	urlsMatch(t, pageDetect.isPRFiles, [
		'https://github.com/sindresorhus/refined-github/pull/148/files'
	]);

	urlsDontMatch(t, pageDetect.isPRFiles, [
		'https://github.com/sindresorhus/refined-github/pull/148',
		'https://github.com/sindresorhus/refined-github/pull/commits',
		'https://github.com/sindresorhus/refined-github/pulls'
	]);
});

test('isPRCommit', t => {
	urlsMatch(t, pageDetect.isPRCommit, [
		'https://github.com/sindresorhus/refined-github/pull/148/commits/0019603b83bd97c2f7ef240969f49e6126c5ec85',
		'https://github.com/sindresorhus/refined-github/pull/148/commits/00196'
	]);

	urlsDontMatch(t, pageDetect.isPRCommit, [
		'https://github.com/sindresorhus/refined-github/pull/148',
		'https://github.com/sindresorhus/refined-github/pull/commits',
		'https://github.com/sindresorhus/refined-github/pulls'
	]);
});

test('isCommitList', t => {
	urlsMatch(t, pageDetect.isCommitList, [
		'https://github.com/sindresorhus/refined-github/commits/master?page=2',
		'https://github.com/sindresorhus/refined-github/commits/test-branch',
		'https://github.com/sindresorhus/refined-github/commits/0.13.0',
		'https://github.com/sindresorhus/refined-github/commits/230c2',
		'https://github.com/sindresorhus/refined-github/commits/230c2935fc5aea9a681174ddbeba6255ca040d63'
	]);

	urlsDontMatch(t, pageDetect.isCommitList, [
		'https://github.com/sindresorhus/refined-github/pull/148',
		'https://github.com/sindresorhus/refined-github/pull/commits',
		'https://github.com/sindresorhus/refined-github/branches'
	]);
});

test('isSingleCommit', t => {
	urlsMatch(t, pageDetect.isSingleCommit, [
		'https://github.com/sindresorhus/refined-github/commit/5b614b9035f2035b839f48b4db7bd5c3298d526f',
		'https://github.com/sindresorhus/refined-github/commit/5b614'
	]);

	urlsDontMatch(t, pageDetect.isSingleCommit, [
		'https://github.com/sindresorhus/refined-github/pull/148/commits',
		'https://github.com/sindresorhus/refined-github/branches'
	]);
});

test('isReleases', t => {
	urlsMatch(t, pageDetect.isReleases, [
		'https://github.com/sindresorhus/refined-github/releases'
	]);

	urlsDontMatch(t, pageDetect.isReleases, [
		'https://github.com/sindresorhus/refined-github',
		'https://github.com/sindresorhus/refined-github/graphs'
	]);
});

test('isBlame', t => {
	urlsMatch(t, pageDetect.isBlame, [
		'https://github.com/sindresorhus/refined-github/blame/master/package.json'
	]);

	urlsDontMatch(t, pageDetect.isBlame, [
		'https://github.com/sindresorhus/refined-github/blob/master/package.json'
	]);
});

test('getOwnerAndRepo', t => {
	const ownerAndRepo = {
		'https://github.com/sindresorhus/refined-github/pull/148': {
			ownerName: 'sindresorhus',
			repoName: 'refined-github'
		},
		'https://github.com/DrewML/GifHub/blob/master/.gitignore': {
			ownerName: 'DrewML',
			repoName: 'GifHub'
		}
	};

	Object.keys(ownerAndRepo).forEach(url => {
		location.href = url;
		t.deepEqual(ownerAndRepo[url], pageDetect.getOwnerAndRepo());
	});
});

test('isSingleFile', t => {
	urlsMatch(t, pageDetect.isSingleFile, [
		'https://github.com/sindresorhus/refined-github/blob/master/.gitattributes',
		'https://github.com/sindresorhus/refined-github/blob/fix-narrow-diff/extension/custom.css'
	]);

	urlsDontMatch(t, pageDetect.isSingleFile, [
		'https://github.com/sindresorhus/refined-github/pull/164/files',
		'https://github.com/sindresorhus/refined-github/commit/57bf4'
	]);
});
