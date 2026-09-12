import cssPlugin from '@eslint/css';
import {RuleTester} from 'eslint';
import {test} from 'vitest';

import rule from './css-prefer-nesting.js';

test('css-prefer-nesting', () => {
	const ruleTester = new RuleTester({
		plugins: {css: cssPlugin},
		language: 'css/css',
	});

	ruleTester.run('css-prefer-nesting', rule, {
		valid: [
			{code: 'a:is(.foo, .bar) {}'},
			{code: '&:is(:focus, :hover) svg {}'},
			{code: 'a :is(.foo, .bar), b {}'},
			{code: 'a :is(.foo, .bar) b, c {}'},
		],
		invalid: [
			{
				code: 'a :is(.foo, .bar) {}',
				output: 'a {\n\t.foo, .bar {}\n}',
				errors: [{messageId: 'descendantIs'}],
			},
			{
				code: ':is(.foo, .bar) a[data-x] {}',
				output: '.foo, .bar {\n\ta[data-x] {}\n}',
				errors: [{messageId: 'descendantIs'}],
			},
			{
				code: ':is(.foo, .bar)::before {}',
				output: '.foo, .bar {\n\t&::before {}\n}',
				errors: [{messageId: 'descendantIs'}],
			},
			{
				code: ':is(a, button).rgh-own-conversation {}',
				output: 'a, button {\n\t&.rgh-own-conversation {}\n}',
				errors: [{messageId: 'descendantIs'}],
			},
			{
				code: 'a :is(.foo, .bar) b {}',
				output: null,
				errors: [{messageId: 'descendantIs'}],
			},
			{
				code: 'a :is(.foo, .bar).baz {}',
				output: null,
				errors: [{messageId: 'descendantIs'}],
			},
		],
	});
});
