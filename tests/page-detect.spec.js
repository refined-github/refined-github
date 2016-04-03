import test from 'ava';
import Window from './fixtures/window';

global.window = new Window();
global.location = window.location;
require('../extension/page-detect.js');
const {pageDetect} = window;

const urisMatch = (t, fn, testURIs = []) => {
	testURIs.forEach(uri => {
		location.href = uri;
		t.true(fn());
	});
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

test.todo('isIssue');
