import cssPlugin from '@eslint/css';
import {run} from 'eslint-vitest-rule-tester';

import rule from './css-require-fuchsia-fallback.js';

run({
	name: 'css-require-fuchsia-fallback',
	rule,
	configs: {
		plugins: {css: cssPlugin},
		language: 'css/css',
	},
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
