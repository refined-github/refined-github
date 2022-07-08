import {expect, test} from 'vitest';

import GitHubURL from './github-url';

test('branch', () => {
	const url = new GitHubURL('https://github.com/microsoft/TypeScript/tree/master');
	expect(url.user).toBe('microsoft');
	expect(url.repository).toBe('TypeScript');
	expect(url.route).toBe('tree');
	expect(url.branch).toBe('master');
	expect(url.filePath).toBe('');
	expect(url.pathname).toBe('/microsoft/TypeScript/tree/master');
	expect(url.href).toBe('https://github.com/microsoft/TypeScript/tree/master');
	expect(String(url)).toBe('https://github.com/microsoft/TypeScript/tree/master');
});

test('branch with multiple slashes', () => {
	const url = new GitHubURL('https://github.com/yakov116/TestR/tree/this/branch%2Fhas%2Fmany%2Fslashes');
	expect(url.user).toBe('yakov116');
	expect(url.repository).toBe('TestR');
	expect(url.route).toBe('tree');
	expect(url.branch).toBe('this/branch/has/many/slashes');
	expect(url.filePath).toBe('');
	expect(url.pathname).toBe('/yakov116/TestR/tree/this/branch/has/many/slashes');
	expect(url.href).toBe('https://github.com/yakov116/TestR/tree/this/branch/has/many/slashes');
	expect(String(url)).toBe('https://github.com/yakov116/TestR/tree/this/branch/has/many/slashes');
});

test('object', () => {
	const url = new GitHubURL('https://github.com/microsoft/TypeScript/tree/master/src');
	expect(url.user).toBe('microsoft');
	expect(url.repository).toBe('TypeScript');
	expect(url.route).toBe('tree');
	expect(url.branch).toBe('master');
	expect(url.filePath).toBe('src');
	expect(url.pathname).toBe('/microsoft/TypeScript/tree/master/src');
	expect(url.href).toBe('https://github.com/microsoft/TypeScript/tree/master/src');
	expect(String(url)).toBe('https://github.com/microsoft/TypeScript/tree/master/src');
});

test('nested object', () => {
	const url = new GitHubURL('https://github.com/microsoft/TypeScript/tree/master/src/index.js');
	expect(url.user).toBe('microsoft');
	expect(url.repository).toBe('TypeScript');
	expect(url.route).toBe('tree');
	expect(url.branch).toBe('master');
	expect(url.filePath).toBe('src/index.js');
	expect(url.pathname).toBe('/microsoft/TypeScript/tree/master/src/index.js');
	expect(url.href).toBe('https://github.com/microsoft/TypeScript/tree/master/src/index.js');
	expect(String(url)).toBe('https://github.com/microsoft/TypeScript/tree/master/src/index.js');
});

test('change branch', () => {
	const url = new GitHubURL('https://github.com/microsoft/TypeScript/tree/master/src/index.js').assign({
		branch: 'dev',
	});
	expect(url.user).toBe('microsoft');
	expect(url.repository).toBe('TypeScript');
	expect(url.route).toBe('tree');
	expect(url.branch).toBe('dev');
	expect(url.filePath).toBe('src/index.js');
	expect(url.pathname).toBe('/microsoft/TypeScript/tree/dev/src/index.js');
	expect(url.href).toBe('https://github.com/microsoft/TypeScript/tree/dev/src/index.js');
	expect(String(url)).toBe('https://github.com/microsoft/TypeScript/tree/dev/src/index.js');
});

test('change filePath', () => {
	const url = new GitHubURL('https://github.com/microsoft/TypeScript/tree/master/src/index.js').assign({
		filePath: 'package.json',
	});
	expect(url.user).toBe('microsoft');
	expect(url.repository).toBe('TypeScript');
	expect(url.route).toBe('tree');
	expect(url.branch).toBe('master');
	expect(url.filePath).toBe('package.json');
	expect(url.pathname).toBe('/microsoft/TypeScript/tree/master/package.json');
	expect(url.href).toBe('https://github.com/microsoft/TypeScript/tree/master/package.json');
	expect(String(url)).toBe('https://github.com/microsoft/TypeScript/tree/master/package.json');
});

test('get filePath from search', () => {
	const url = new GitHubURL('https://github.com/yakov116/refined-github/commits/f23b687b3b89aa95a76193722cdfeff740646670?after=f23b687b3b89aa95a76193722cdfeff740646670+34&path%5B%5D=source&path%5B%5D=features&path%5B%5D=release-download-count.tsx');
	expect(url.user).toBe('yakov116');
	expect(url.repository).toBe('refined-github');
	expect(url.route).toBe('commits');
	expect(url.branch).toBe('f23b687b3b89aa95a76193722cdfeff740646670');
	expect(url.filePath).toBe('source/features/release-download-count.tsx');
	expect(url.pathname).toBe(
		'/yakov116/refined-github/commits/f23b687b3b89aa95a76193722cdfeff740646670/source/features/release-download-count.tsx',
	);
	expect(url.href).toBe(
		'https://github.com/yakov116/refined-github/commits/f23b687b3b89aa95a76193722cdfeff740646670/source/features/release-download-count.tsx?after=f23b687b3b89aa95a76193722cdfeff740646670+34',
	);
	expect(url.search).toBe('?after=f23b687b3b89aa95a76193722cdfeff740646670+34');
	expect(String(url)).toBe(
		'https://github.com/yakov116/refined-github/commits/f23b687b3b89aa95a76193722cdfeff740646670/source/features/release-download-count.tsx?after=f23b687b3b89aa95a76193722cdfeff740646670+34',
	);
});
