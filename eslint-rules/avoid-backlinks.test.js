import cssPlugin from '@eslint/css';
import {run} from 'eslint-vitest-rule-tester';

import rule from './avoid-backlinks.js';

run({
	name: 'avoid-backlinks (js)',
	rule,
	valid: [
		'// https://github.com/refined-github/sandbox/pull/1',
		'// https://github.com/fregante/ghat/issues/1',
		'// https://github.com/sindresorhus/np/issues/82#event-22200037448',
		'// TODO: Use https://github.com/facebook/react/issues/1 instead',
		'/* TODO: https://github.com/facebook/react/pull/20646 */',
		'// https://togithub.com/facebook/react/pull/20646',
		'// https://github.com/orgs/community/discussions',
		"const url = 'https://github.com/facebook/react/pull/20646';",
	],
	invalid: [
		{
			code: '// https://github.com/facebook/react/pull/20646',
			output: '// https://togithub.com/facebook/react/pull/20646',
			errors: 1,
		},
		{
			code: '/* Test URLs:\n- https://github.com/facebook/react/issues/1\n- https://github.com/eslint/eslint/pull/17 */',
			output:
				'/* Test URLs:\n- https://togithub.com/facebook/react/issues/1\n- https://togithub.com/eslint/eslint/pull/17 */',
			errors: 2,
		},
	],
});

run({
	name: 'avoid-backlinks (css)',
	rule,
	configs: {
		plugins: {css: cssPlugin},
		language: 'css/css',
	},
	valid: [
		'/* Test: https://github.com/refined-github/sandbox/pull/1 */\n.selector {}',
		'/* Test: https://togithub.com/facebook/react/pull/20646 */\n.selector {}',
	],
	invalid: [
		{
			code: '/* Info: https://github.com/facebook/react/pull/20646 */\n.selector {}',
			output: '/* Info: https://togithub.com/facebook/react/pull/20646 */\n.selector {}',
			errors: 1,
		},
	],
});
