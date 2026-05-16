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
				code: '.selector { margin-top: var(--base-size-16, 22.22em); }',
			},
			{
				code: '.selector { margin-top: var(--base-size-16, 4.44em); }',
			},
			{
				code: '.selector { margin-top: var(--local-size); --local-size: 1px; }',
			},
			{
				code: '.selector { top: calc(var(--base-sticky-header-height, 2.22em) + 10px); }',
			},
			{
				code: '.selector { bottom: var(--base-size-16, 2.22em); }',
			},
			{
				code: '.selector { right: var(--base-size-16, 2.22em); }',
			},
			{
				code: '.selector { left: var(--base-size-16, 2.22em); }',
			},
			{
				code: '.selector { margin: var(--base-size-16, 2.22em); }',
			},
			{
				code: '.selector { padding: var(--base-size-16, 2.22em); }',
			},
			{
				code: '.selector { width: var(--base-size-16, 2.22em); }',
			},
			{
				code: '.selector { height: var(--base-size-16, 2.22em); }',
			},
			{
				code: '.selector { border: var(--base-size-16, 2.22em) solid; }',
			},
			{
				code: '.selector { border-top-left-radius: var(--base-size-16, 2.22em); }',
			},
		],
		invalid: [
			{
				code: '.selector { margin-top: var(--base-size-16); }',
				errors: [{messageId: 'missingFallback'}],
			},
			{
				code: '.selector { margin-top: var(--base-size-16, 1px); }',
				errors: [{messageId: 'missingFallback'}],
			},
			{
				code: '.selector { margin-top: var(--base-size-16, var(--base-size-8)); }',
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
				code: '.selector { top: var(--base-size-16); }',
				errors: [{messageId: 'missingFallback'}],
			},
			{
				code: '.selector { bottom: var(--base-size-16); }',
				errors: [{messageId: 'missingFallback'}],
			},
			{
				code: '.selector { margin: var(--base-size-16); }',
				errors: [{messageId: 'missingFallback'}],
			},
			{
				code: '.selector { padding: var(--base-size-16); }',
				errors: [{messageId: 'missingFallback'}],
			},
			{
				code: '.selector { width: var(--base-size-16); }',
				errors: [{messageId: 'missingFallback'}],
			},
			{
				code: '.selector { border: var(--base-size-16) solid; }',
				errors: [{messageId: 'missingFallback'}],
			},
		],
	});
});
