import cssPlugin from '@eslint/css';
import {run} from 'eslint-vitest-rule-tester';

import rule from './css-documentation.js';

run({
	name: 'css-documentation',
	rule,
	configs: {
		plugins: {css: cssPlugin},
		language: 'css/css',
	},
	valid: [
		{
			code: `/* Description */
/* Info: https://github.com/refined-github/refined-github/issues/1 */
/* Test: https://github.com/refined-github/sandbox/pull/1 */
.selector {}`,
		},
	],
	invalid: [
		{
			code: `/* TODO [2029-08-01]: Remove */
/* Make the PR alert banner non-sticky so it doesn't cover the right sidebar */
/* Info: https://github.com/refined-github/refined-github/issues/8975 */
.sticky-header-wrapper.is-stuck .pr-alerts-banner {}`,
			errors: [{message: /Missing: Test/}],
		},
		{
			code: `/* Test: https://github.com/refined-github/sandbox/pull/47#pullrequestreview-4175514676 */
review-thread-collapsible > .js-toggle-outdated-comments {}`,
			errors: [{message: /Missing: Description, Info/}],
		},
	],
});
