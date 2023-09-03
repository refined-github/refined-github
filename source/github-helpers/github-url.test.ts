import {test, assert} from 'vitest';

import GitHubFileURL from './github-file-url.js';

test('branch', () => {
	const url = new GitHubFileURL('https://github.com/microsoft/TypeScript/tree/master');
	assert.equal(url.user, 'microsoft');
	assert.equal(url.repository, 'TypeScript');
	assert.equal(url.route, 'tree');
	assert.equal(url.branch, 'master');
	assert.equal(url.filePath, '');
	assert.equal(url.pathname, '/microsoft/TypeScript/tree/master');
	assert.equal(url.href, 'https://github.com/microsoft/TypeScript/tree/master');
	assert.equal(String(url), 'https://github.com/microsoft/TypeScript/tree/master');
});

test('branch with multiple slashes', () => {
	const url = new GitHubFileURL('https://github.com/yakov116/TestR/tree/this/branch%2Fhas%2Fmany%2Fslashes');
	assert.equal(url.user, 'yakov116');
	assert.equal(url.repository, 'TestR');
	assert.equal(url.route, 'tree');
	assert.equal(url.branch, 'this/branch/has/many/slashes');
	assert.equal(url.filePath, '');
	assert.equal(url.pathname, '/yakov116/TestR/tree/this/branch/has/many/slashes');
	assert.equal(url.href, 'https://github.com/yakov116/TestR/tree/this/branch/has/many/slashes');
	assert.equal(String(url), 'https://github.com/yakov116/TestR/tree/this/branch/has/many/slashes');
});

test('object', () => {
	const url = new GitHubFileURL('https://github.com/microsoft/TypeScript/tree/master/src');
	assert.equal(url.user, 'microsoft');
	assert.equal(url.repository, 'TypeScript');
	assert.equal(url.route, 'tree');
	assert.equal(url.branch, 'master');
	assert.equal(url.filePath, 'src');
	assert.equal(url.pathname, '/microsoft/TypeScript/tree/master/src');
	assert.equal(url.href, 'https://github.com/microsoft/TypeScript/tree/master/src');
	assert.equal(String(url), 'https://github.com/microsoft/TypeScript/tree/master/src');
});

test('nested object', () => {
	const url = new GitHubFileURL('https://github.com/microsoft/TypeScript/tree/master/src/index.js');
	assert.equal(url.user, 'microsoft');
	assert.equal(url.repository, 'TypeScript');
	assert.equal(url.route, 'tree');
	assert.equal(url.branch, 'master');
	assert.equal(url.filePath, 'src/index.js');
	assert.equal(url.pathname, '/microsoft/TypeScript/tree/master/src/index.js');
	assert.equal(url.href, 'https://github.com/microsoft/TypeScript/tree/master/src/index.js');
	assert.equal(String(url), 'https://github.com/microsoft/TypeScript/tree/master/src/index.js');
});

test('change branch', () => {
	const url = new GitHubFileURL('https://github.com/microsoft/TypeScript/tree/master/src/index.js').assign({
		branch: 'dev',
	});
	assert.equal(url.user, 'microsoft');
	assert.equal(url.repository, 'TypeScript');
	assert.equal(url.route, 'tree');
	assert.equal(url.branch, 'dev');
	assert.equal(url.filePath, 'src/index.js');
	assert.equal(url.pathname, '/microsoft/TypeScript/tree/dev/src/index.js');
	assert.equal(url.href, 'https://github.com/microsoft/TypeScript/tree/dev/src/index.js');
	assert.equal(String(url), 'https://github.com/microsoft/TypeScript/tree/dev/src/index.js');
});

test('change filePath', () => {
	const url = new GitHubFileURL('https://github.com/microsoft/TypeScript/tree/master/src/index.js').assign({
		filePath: 'package.json',
	});
	assert.equal(url.user, 'microsoft');
	assert.equal(url.repository, 'TypeScript');
	assert.equal(url.route, 'tree');
	assert.equal(url.branch, 'master');
	assert.equal(url.filePath, 'package.json');
	assert.equal(url.pathname, '/microsoft/TypeScript/tree/master/package.json');
	assert.equal(url.href, 'https://github.com/microsoft/TypeScript/tree/master/package.json');
	assert.equal(String(url), 'https://github.com/microsoft/TypeScript/tree/master/package.json');
});

test('get filePath from search', () => {
	const url = new GitHubFileURL('https://github.com/yakov116/refined-github/commits/f23b687b3b89aa95a76193722cdfeff740646670?after=f23b687b3b89aa95a76193722cdfeff740646670+34&path%5B%5D=source&path%5B%5D=features&path%5B%5D=release-download-count.tsx');
	assert.equal(url.user, 'yakov116');
	assert.equal(url.repository, 'refined-github');
	assert.equal(url.route, 'commits');
	assert.equal(url.branch, 'f23b687b3b89aa95a76193722cdfeff740646670');
	assert.equal(url.filePath, 'source/features/release-download-count.tsx');
	assert.equal(url.pathname, '/yakov116/refined-github/commits/f23b687b3b89aa95a76193722cdfeff740646670/source/features/release-download-count.tsx');
	assert.equal(url.href, 'https://github.com/yakov116/refined-github/commits/f23b687b3b89aa95a76193722cdfeff740646670/source/features/release-download-count.tsx?after=f23b687b3b89aa95a76193722cdfeff740646670+34');
	assert.equal(url.search, '?after=f23b687b3b89aa95a76193722cdfeff740646670+34');
	assert.equal(String(url), 'https://github.com/yakov116/refined-github/commits/f23b687b3b89aa95a76193722cdfeff740646670/source/features/release-download-count.tsx?after=f23b687b3b89aa95a76193722cdfeff740646670+34');
});
