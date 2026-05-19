import {RuleTester} from 'eslint';
import {test} from 'vitest';

import byo from './byo.js';

test('byo supports one or more selector/message objects', () => {
	const ruleTester = new RuleTester({
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
		},
	});

	ruleTester.run('byo/multi-config', byo.rules.anything, {
		valid: [
			{
				code: 'baz();',
				options: [
					{
						selector: 'Identifier[name=foo]',
						message: 'No foo',
					},
					{
						selector: 'Identifier[name=bar]',
						message: 'No bar',
					},
				],
			},
		],
		invalid: [
			{
				code: 'foo();',
				options: [
					{
						selector: 'Identifier[name=foo]',
						message: 'No foo',
					},
				],
				errors: [{message: 'No foo'}],
			},
			{
				code: 'foo(); bar();',
				options: [
					{
						selector: 'Identifier[name=foo]',
						message: 'No foo',
					},
					{
						selector: 'Identifier[name=bar]',
						message: 'No bar',
					},
				],
				errors: [{message: 'No foo'}, {message: 'No bar'}],
			},
			{
				code: 'foo();',
				options: [
					{
						selector: 'Identifier[name=foo]',
						message: 'No foo 1',
					},
					{
						selector: 'Identifier[name=foo]',
						message: 'No foo 2',
					},
				],
				errors: [{message: 'No foo 1'}, {message: 'No foo 2'}],
			},
		],
	});
});
