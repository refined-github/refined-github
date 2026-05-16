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
				code: '.selector { margin-top: var(--base-size-16, 2.22em); }',
			},
			{
				code: '.selector { margin-top: var(--base-size-16, 4.44em); }',
			},
			{
				code: '.selector { top: calc(var(--base-sticky-header-height, 2.22em) + 10px); }',
			},
			{
				code: '.selector { margin-top: var(--local-size); --local-size: 1px; }',
			},
		],
		invalid: [
			{
				code: '.selector { margin-top: var(--base-size-16); }',
				errors: [{messageId: 'missingFallback'}],
			},
			{
				code: '.selector { margin-top: var(--base-size-16 /* 2.22em */); }',
				errors: [{messageId: 'missingFallback'}],
			},
			{
				code: '.selector { top: calc(var(--base-sticky-header-height, 0px) + 10px); }',
				errors: [{messageId: 'missingFallback'}],
			},
			{
				code: '.selector { top: calc(var(--base-sticky-header-height, 2.22em) + var(--base-size-8, 0px)); }',
				errors: [{messageId: 'missingFallback'}],
			},
		],
	});
});
