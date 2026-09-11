import cssPlugin from '@eslint/css';
import {RuleTester} from 'eslint';
import {test} from 'vitest';

import rule from './css-no-useless-function.js';

test('css-no-useless-function', () => {
	const ruleTester = new RuleTester({
		plugins: {css: cssPlugin},
		language: 'css/css',
	});

	ruleTester.run('css-no-useless-function', rule, {
		valid: [
			{
				code: ':is(.foo, .bar) {}',
			},
			{
				code: 'a:is(.foo, .bar) {}',
			},
			{
				code: '.foo:is(:hover, :focus) {}',
			},
			{
				code: '.foo:has(:is(.bar, .baz)) {}',
			},
		],

		invalid: [
			{
				code: ':is(.foo) {}',
				output: '.foo {}',
				errors: [{messageId: 'unnecessaryIs'}],
			},
			{
				code: 'a:is(.foo) {}',
				output: 'a.foo {}',
				errors: [{messageId: 'unnecessaryIs'}],
			},
			{
				code: '.foo:is(:hover) {}',
				output: '.foo:hover {}',
				errors: [{messageId: 'unnecessaryIs'}],
			},
			{
				code: '.foo :is(.bar) {}',
				output: '.foo .bar {}',
				errors: [{messageId: 'unnecessaryIs'}],
			},
			{
				code: ':is(.foo) a {}',
				output: '.foo a {}',
				errors: [{messageId: 'unnecessaryIs'}],
			},
			{
				code: '.rgh-tic:is(:nth-of-type(5n+1)):has(~ .rgh-tic:hover:nth-of-type(5n+1))::before {}',
				output: '.rgh-tic:nth-of-type(5n+1):has(~ .rgh-tic:hover:nth-of-type(5n+1))::before {}',
				errors: [{messageId: 'unnecessaryIs'}],
			},
			{
				code: '.foo:has(:is(.bar)) {}',
				output: '.foo:has(.bar) {}',
				errors: [{messageId: 'unnecessaryIs'}],
			},
		],
	});
});
