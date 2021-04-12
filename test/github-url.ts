import test from 'ava';

import './fixtures/globals';
import GitHubURL from '../source/github-helpers/github-url';

document.head.insertAdjacentHTML('beforeend', '<a hidden="" data-hotkey="t" data-pjax="true" href="https://github.com/avajs/ava/find/master"></a>');

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

test('get filePath from search', t => {
	const url = new GitHubURL('https://github.com/yakov116/refined-github/commits/f23b687b3b89aa95a76193722cdfeff740646670?after=f23b687b3b89aa95a76193722cdfeff740646670+34&path%5B%5D=source&path%5B%5D=features&path%5B%5D=release-download-count.tsx');
	t.is(url.user, 'yakov116');
	t.is(url.repository, 'refined-github');
	t.is(url.route, 'commits');
	t.is(url.branch, 'f23b687b3b89aa95a76193722cdfeff740646670');
	t.is(url.filePath, 'source/features/release-download-count.tsx');
	t.is(url.pathname, '/yakov116/refined-github/commits/f23b687b3b89aa95a76193722cdfeff740646670/source/features/release-download-count.tsx');
	t.is(url.href, 'https://github.com/yakov116/refined-github/commits/f23b687b3b89aa95a76193722cdfeff740646670/source/features/release-download-count.tsx?after=f23b687b3b89aa95a76193722cdfeff740646670+34');
	t.is(url.search, '?after=f23b687b3b89aa95a76193722cdfeff740646670+34');
	t.is(String(url), 'https://github.com/yakov116/refined-github/commits/f23b687b3b89aa95a76193722cdfeff740646670/source/features/release-download-count.tsx?after=f23b687b3b89aa95a76193722cdfeff740646670+34');
});

test('get branch and filePath from search', t => {
	const url = new GitHubURL('https://github.com/sindresorhus/refined-github/commits/Slash/slash?after=ee8b6422d2ddd1199f557594d03e7ee850e843f0+34&branch=Slash%2Fslash&path%5B%5D=webpack.config.ts');
	t.is(url.user, 'sindresorhus');
	t.is(url.repository, 'refined-github');
	t.is(url.route, 'commits');
	t.is(url.branch, 'Slash/slash');
	t.is(url.filePath, 'webpack.config.ts');
	t.is(url.pathname, '/sindresorhus/refined-github/commits/Slash/slash/webpack.config.ts');
	t.is(url.href, 'https://github.com/sindresorhus/refined-github/commits/Slash/slash/webpack.config.ts?after=ee8b6422d2ddd1199f557594d03e7ee850e843f0+34');
	t.is(url.search, '?after=ee8b6422d2ddd1199f557594d03e7ee850e843f0+34');
	t.is(String(url), 'https://github.com/sindresorhus/refined-github/commits/Slash/slash/webpack.config.ts?after=ee8b6422d2ddd1199f557594d03e7ee850e843f0+34');
});
document.querySelector('[data-hotkey="t"]')!.remove();
