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
			{
				code: `div[class^='foo']:is(li[class*='bar'] *) {}`,
			},
			{
				code: `.foo {
	&:is(li[class*='bar'] *) {
		color: red;
	}
}`,
			},
		],

		invalid: [
			{
				code: ':is(.foo) {}',
				output: '.foo {}',
				errors: [{messageId: 'unnecessaryFunction'}],
			},
			{
				code: 'a:is(.foo) {}',
				output: 'a.foo {}',
				errors: [{messageId: 'unnecessaryFunction'}],
			},
			{
				code: '.foo:is(:hover) {}',
				output: '.foo:hover {}',
				errors: [{messageId: 'unnecessaryFunction'}],
			},
			{
				code: '.foo :is(.bar) {}',
				output: '.foo .bar {}',
				errors: [{messageId: 'unnecessaryFunction'}],
			},
			{
				code: ':is(.foo) a {}',
				output: '.foo a {}',
				errors: [{messageId: 'unnecessaryFunction'}],
			},
			{
				code: '.rgh-tic:is(:nth-of-type(5n+1)):has(~ .rgh-tic:hover:nth-of-type(5n+1))::before {}',
				output: '.rgh-tic:nth-of-type(5n+1):has(~ .rgh-tic:hover:nth-of-type(5n+1))::before {}',
				errors: [{messageId: 'unnecessaryFunction'}],
			},
			{
				code: '.foo:has(:is(.bar)) {}',
				output: '.foo:has(.bar) {}',
				errors: [{messageId: 'unnecessaryFunction'}],
			},
			{
				code: `.foo {
	a:is([class^='bar']) {
		color: red;
	}
}`,
				output: `.foo {
	a[class^='bar'] {
		color: red;
	}
}`,
				errors: [{messageId: 'unnecessaryFunction'}],
			},
		],
	});
});
