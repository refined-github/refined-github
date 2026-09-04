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
			{code: ':is(.foo, .bar)::before {}'},
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
				code: 'a :is(.foo, .bar) b {}',
				output: null,
				errors: [{messageId: 'descendantIs'}],
			},
			{
				code: 'a :is(.foo, .bar).baz {}',
				output: null,
				errors: [{messageId: 'descendantIs'}],
			},
			{
				code: 'a :is(.foo), b {}',
				output: null,
				errors: [{messageId: 'descendantIs'}],
			},
		],
	});
});
