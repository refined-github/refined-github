import cssPlugin from '@eslint/css';
import {RuleTester} from 'eslint';
import {test} from 'vitest';

import rule from './css-sort-compound-selector.js';

test('css-sort-compound-selector', () => {
	const ruleTester = new RuleTester({
		plugins: {css: cssPlugin},
		language: 'css/css',
	});

	ruleTester.run('css-sort-compound-selector', rule, {
		valid: [
			{code: 'a {}'},
			{code: '#foo {}'},
			{code: '.foo {}'},
			{code: '[data-x] {}'},
			{code: ':hover {}'},
			{code: '::before {}'},

			{code: 'a#foo.bar[data-x]:hover::before {}'},
			{code: 'a#foo.bar[data-x]:not(.disabled):hover::before {}'},
			{code: ':is(.foo, .bar) {}'},
			{code: 'a:is(.foo, .bar)::before {}'},

			{code: 'a.foo.bar[data-a][data-b]:focus:hover::before {}'},
		],

		invalid: [
			{
				code: '.foo a {}',
				output: '.foo a {}',
				errors: [{messageId: 'sort'}],
			},
			{
				code: '.foo#a {}',
				output: '#a.foo {}',
				errors: [{messageId: 'sort'}],
			},
			{
				code: '[data-x]a {}',
				output: 'a[data-x] {}',
				errors: [{messageId: 'sort'}],
			},
			{
				code: ':hovera {}',
				output: 'a:hover {}',
				errors: [{messageId: 'sort'}],
			},
			{
				code: '::before:hover {}',
				output: ':hover::before {}',
				errors: [{messageId: 'sort'}],
			},
			{
				code: '.foo#a[data-x]:hover::before {}',
				output: 'a#foo? {}',
				errors: [{messageId: 'sort'}],
			},
		],
	});
});
