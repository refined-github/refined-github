import cssPlugin from '@eslint/css';
import {RuleTester} from 'eslint';
import {test} from 'vitest';

import rule from './css-require-em-fallback.js';

test('css-require-em-fallback', () => {
	const ruleTester = new RuleTester({
		plugins: {css: cssPlugin},
		language: 'css/css',
	});

	ruleTester.run('css-require-em-fallback', rule, {
		valid: [
			{
				code: '.selector { margin-left: var(--base-size-16, 2.22em); }',
			},
			{
				code: '.selector { margin-left: var(--base-size-16, 22.22em); }',
			},
			{
				code: '.selector { color: var(--color-fg-muted); }',
			},
			{
				code: '.selector { color: var(--fgColor-muted); }',
			},
			{
				code: '.selector { color: var(--control-checked-bgColor-hover); }',
			},
			{
				code: '.selector { color: rgb(var(--label-r) var(--label-g) var(--label-b)); }',
			},
			{
				code: '.selector { color: var(--rgh-limit-color); }',
			},
			{
				code: '.selector { margin-left: var(--local-size); --local-size: 1px; }',
			},
		],
		invalid: [
			{
				code: '.selector { margin-left: var(--base-size-16); }',
				errors: [{messageId: 'missingFallback'}],
			},
			{
				code: '.selector { margin-left: var(--base-size-16, 1px); }',
				errors: [{messageId: 'missingFallback'}],
			},
			{
				code: '.selector { margin-left: var(--base-size-16, var(--base-size-8)); }',
				errors: [{messageId: 'missingFallback'}],
			},
			{
				code: '.selector { margin-left: var(--base-size-16 /* 2.22em */); }',
				errors: [{messageId: 'missingFallback'}],
			},
		],
	});
});
