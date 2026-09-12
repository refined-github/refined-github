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
			{code: 'a:is(.foo, .bar)::before {}'},

			{code: 'a.foo.bar[data-a][data-b]:focus:hover::before {}'},

			{code: '&.foo {}'},
			{code: '&#id.foo {}'},
			{code: '&:hover {}'},
			{code: '&:hover::before {}'},
			{code: ':hover& {}'},

			// Pseudo-class/pseudo-element order is left alone: CSS grammar
			// already enforces valid affixing, and swapping them changes meaning
			// (e.g. `:hover::before` vs `::before:hover` select different things).
			{code: '::before:hover {}'},
			{code: ':hover::before {}'},
		],

		invalid: [
			{
				code: '.foo#a {}',
				output: '#a.foo {}',
				errors: [{messageId: 'sort'}],
			},
			{
				code: '[data-x]#foo {}',
				output: '#foo[data-x] {}',
				errors: [{messageId: 'sort'}],
			},
			{
				code: '.foo#a[data-x]:hover::before {}',
				output: '#a.foo[data-x]:hover::before {}',
				errors: [{messageId: 'sort'}],
			},
			{
				code: ':is(a, button).rgh-own-conversation {}',
				output: '.rgh-own-conversation:is(a, button) {}',
				errors: [{messageId: 'sort'}],
			},
			{
				code: '.foo& {}',
				output: '&.foo {}',
				errors: [{messageId: 'sort'}],
			},
		],
	});
});
