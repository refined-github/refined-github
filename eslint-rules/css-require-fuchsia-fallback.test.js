import cssPlugin from '@eslint/css';
import {RuleTester} from 'eslint';
import {test} from 'vitest';

import rule from './css-require-fuchsia-fallback.js';

test('css-require-fuchsia-fallback', () => {
	const ruleTester = new RuleTester({
		plugins: {css: cssPlugin},
		language: 'css/css',
	});

	ruleTester.run('css-require-fuchsia-fallback', rule, {
		valid: [
			{
				code: '.selector { color: var(--color-fg-muted, fuchsia); }',
			},
			{
				code: '.selector { color: var(--fgColor-muted, var(--color-fg-muted, fuchsia)); }',
			},
			{
				code: '.selector { color: var(--name); }',
			},
			{
				code: '.selector { color: var(--rgh-limit-color); }',
			},
		],
		invalid: [
			{
				code: '.selector { color: var(--color-fg-muted); }',
				errors: [{messageId: 'missingColorFallback'}],
			},
			{
				code: '.selector { color: var(--fgColor-muted, var(--color-fg-muted)); }',
				errors: [{messageId: 'missingColorFallback'}],
			},
		],
	});
});
