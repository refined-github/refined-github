import cssPlugin from '@eslint/css';
import {RuleTester} from 'eslint';
import {test} from 'vitest';

import rule from './css-no-single-is-where.js';

test('css-no-single-is-where', () => {
	const ruleTester = new RuleTester({
		plugins: {css: cssPlugin},
		language: 'css/css',
	});

	ruleTester.run('css-no-single-is-where', rule, {
		valid: [
			{code: 'a:is(.foo, .bar) {}'},
			{code: ':where(.foo, #bar) {}'},
			{code: 'article :is(h1, h2, h3) {}'},
		],
		invalid: [
			{
				code: 'a:is(.foo) {}',
				output: 'a.foo {}',
				errors: [{messageId: 'singleItem', data: {name: 'is'}}],
			},
			{
				code: ':where(#header) {}',
				output: '#header {}',
				errors: [{messageId: 'singleItem', data: {name: 'where'}}],
			},
			{
				code: 'div :is(.container) p {}',
				output: 'div .container p {}',
				errors: [{messageId: 'singleItem', data: {name: 'is'}}],
			},
		],
	});
});
