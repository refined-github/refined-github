import test from 'ava';

import './fixtures/globals';
import GitHubURL from '../source/github-helpers/github-url';

test('branch', t => {
	const url = new GitHubURL('https://github.com/microsoft/TypeScript/tree/master');
	t.is(url.user, 'microsoft');
	t.is(url.repository, 'TypeScript');
	t.is(url.route, 'tree');
	t.is(url.branch, 'master');
	t.is(url.filePath, '');
	t.is(url.pathname, '/microsoft/TypeScript/tree/master');
	t.is(url.href, 'https://github.com/microsoft/TypeScript/tree/master');
	t.is(String(url), 'https://github.com/microsoft/TypeScript/tree/master');
});

test('object', t => {
	const url = new GitHubURL('https://github.com/microsoft/TypeScript/tree/master/src');
	t.is(url.user, 'microsoft');
	t.is(url.repository, 'TypeScript');
	t.is(url.route, 'tree');
	t.is(url.branch, 'master');
	t.is(url.filePath, 'src');
	t.is(url.pathname, '/microsoft/TypeScript/tree/master/src');
	t.is(url.href, 'https://github.com/microsoft/TypeScript/tree/master/src');
	t.is(String(url), 'https://github.com/microsoft/TypeScript/tree/master/src');
});

test('nested object', t => {
	const url = new GitHubURL('https://github.com/microsoft/TypeScript/tree/master/src/index.js');
	t.is(url.user, 'microsoft');
	t.is(url.repository, 'TypeScript');
	t.is(url.route, 'tree');
	t.is(url.branch, 'master');
	t.is(url.filePath, 'src/index.js');
	t.is(url.pathname, '/microsoft/TypeScript/tree/master/src/index.js');
	t.is(url.href, 'https://github.com/microsoft/TypeScript/tree/master/src/index.js');
	t.is(String(url), 'https://github.com/microsoft/TypeScript/tree/master/src/index.js');
});

test('change branch', t => {
	const url = new GitHubURL('https://github.com/microsoft/TypeScript/tree/master/src/index.js').assign({
		branch: 'dev'
	});
	t.is(url.user, 'microsoft');
	t.is(url.repository, 'TypeScript');
	t.is(url.route, 'tree');
	t.is(url.branch, 'dev');
	t.is(url.filePath, 'src/index.js');
	t.is(url.pathname, '/microsoft/TypeScript/tree/dev/src/index.js');
	t.is(url.href, 'https://github.com/microsoft/TypeScript/tree/dev/src/index.js');
	t.is(String(url), 'https://github.com/microsoft/TypeScript/tree/dev/src/index.js');
});

test('change filePath', t => {
	const url = new GitHubURL('https://github.com/microsoft/TypeScript/tree/master/src/index.js').assign({
		filePath: 'package.json'
	});
	t.is(url.user, 'microsoft');
	t.is(url.repository, 'TypeScript');
	t.is(url.route, 'tree');
	t.is(url.branch, 'master');
	t.is(url.filePath, 'package.json');
	t.is(url.pathname, '/microsoft/TypeScript/tree/master/package.json');
	t.is(url.href, 'https://github.com/microsoft/TypeScript/tree/master/package.json');
	t.is(String(url), 'https://github.com/microsoft/TypeScript/tree/master/package.json');
});
