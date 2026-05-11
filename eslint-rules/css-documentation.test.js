import {RuleTester} from 'eslint';
import cssPlugin from '@eslint/css';
import {test} from 'vitest';

import rule from './css-documentation.js';

test('css-documentation', () => {
	const ruleTester = new RuleTester({
		plugins: {css: cssPlugin},
		language: 'css/css',
	});

	ruleTester.run('css-documentation', rule, {
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
				code: `/* TODO: Remove after July 2026 */
/* Make the PR alert banner non-sticky so it doesn't cover the right sidebar */
/* Info: https://github.com/refined-github/refined-github/issues/8975 */
.sticky-header-wrapper.is-stuck .pr-alerts-banner {}`,
				errors: [{message: /Missing: Test\./}],
			},
			{
				code: `/* Test: https://github.com/refined-github/sandbox/pull/47#pullrequestreview-4175514676 */
review-thread-collapsible > .js-toggle-outdated-comments {}`,
				errors: [{message: /Missing: Description, Info\./}],
			},
		],
	});
});
