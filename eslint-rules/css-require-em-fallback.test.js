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
				code: '.selector { margin-top: var(--local-size); --local-size: 1px; }',
			},
			{
				code: '.selector { transition: var(--duration-fast, 0.2s) var(--easing-easeInOut, ease-in-out); }',
			},
			{
				code: '.selector { animation-duration: var(--duration-fast, 200ms); }',
			},
			{
				code: '.selector { background-image: var(--avatar-url); }',
			},
			{
				code: '.selector { box-shadow: 0 calc((10px + var(--borderRadius-medium)) * -1) 0 0 black; }',
			},
			{
				code: '.selector { margin-left: var(--base-size-16); }',
			},
			{
				code: '.selector { margin-left: var(--base-size-16, 2.22em); }',
			},
			{
				code: '.selector { top: calc(var(--base-sticky-header-height, 2.22em) + 10px); }',
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
		],
	});
});
