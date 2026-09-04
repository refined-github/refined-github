import cssPlugin from '@eslint/css';
import {RuleTester} from 'eslint';
import {test} from 'vitest';

import rule from './avoid-is-selector.js';

test('avoid-is-selector', () => {
	const ruleTester = new RuleTester({
		plugins: {css: cssPlugin},
		language: 'css/css',
	});

	ruleTester.run('avoid-is-selector', rule, {
		valid: [
			{code: 'a:is(.foo, .bar) {}'},
			{code: ':is(.foo, .bar) a {}'},
		],
		invalid: [
			{
				code: 'a :is(.foo, .bar) {}',
				output: 'a {\n\t.foo, .bar {}\n}',
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
