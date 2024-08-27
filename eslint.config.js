import antfu from '@antfu/eslint-config';

export default antfu(
	{
		react: true,
		stylistic: {
			indent: 'tab',
		},
		globals: [
			'browser',
		],

		typescript: {
			overrides: {
				'ts/consistent-type-definitions': 'off', // Review later
				'ts/explicit-function-return-type': [
					'error',
					{
						allowExpressions: true,
					},
				],
			},
		},
		rules: {

			'unicorn/expiring-todo-comments': 'off', // We just got too many, too much noise
			'react-refresh/only-export-components': 'off', // N/A
			'react/no-missing-key': 'off', // N/A

			'no-irregular-whitespace': 'off', // We do want to use non-breaking spaces
			'jsdoc/check-alignment': 'off', // Can't autofix, tedious manual fix
			'style/jsx-tag-spacing': 'off', // TODO: Later, together with JSX single quotes

			// Antfu style disagreements
			'regexp/no-useless-character-class': 'off', // [/] is more readable than \/
			'style/object-curly-spacing': ['error', 'never'], // Unnecessary change for now
			'style/block-spacing': ['error', 'never'], // Same
			'jsonc/array-bracket-spacing': 'off', // Same
			'style/semi': ['error', 'always'],
			'prefer-template': 'off', // When there's a single `+` templates are less readable

			// Restore errors
			'unicorn/prefer-export-from': 'error',
			'unicorn/no-array-callback-reference': 'error',
			'no-await-in-loop': 'error',
			'new-cap': [
				'error',
				{
					newIsCap: true,
					capIsNew: true,
				},
			],

			'test/consistent-test-it': 'off',
			'sort-imports': 'off',
			'style/jsx-one-expression-per-line': 'off',
			'style/arrow-parens': ['error', 'as-needed'],
			'style/brace-style': ['error', '1tbs'],
			'antfu/top-level-function': 'off', // Maybe later
			'no-console': 'off',
			'unused-imports/no-unused-vars': 'off', // Buggy
			'jsonc/sort-keys': 'off',
			'regexp/strict': 'off',

			'ts/no-restricted-types': [
				'error',
				{
					types: {
						'object': {
							message: 'The `object` type is hard to use. Use `Record<string, unknown>` instead. See: https://github.com/typescript-eslint/typescript-eslint/pull/848',
							fixWith: 'Record<string, unknown>',
						},
						'null': {
							message: 'Use `undefined` instead. See: https://github.com/sindresorhus/meta/issues/7',
							fixWith: 'undefined',
						},
						'Buffer': {
							message: 'Use Uint8Array instead. See: https://sindresorhus.com/blog/goodbye-nodejs-buffer',
							suggest: [
								'Uint8Array',
							],
						},
						'[]': 'Don\'t use the empty array type `[]`. It only allows empty arrays. Use `SomeType[]` instead.',
						'[[]]': 'Don\'t use `[[]]`. It only allows an array with a single element which is an empty array. Use `SomeType[][]` instead.',
						'[[[]]]': 'Don\'t use `[[[]]]`. Use `SomeType[][][]` instead.',
						'[[[[]]]]': 'ur drunk 🤡',
						'[[[[[]]]]]': '🦄💥',
					},
				},
			],
			'style/member-delimiter-style': ['error', {
				multiline: {
					delimiter: 'semi',
				},
			}],
			'no-restricted-syntax': [
				'error',
				{
					selector:
						':matches([callee.name=delegate], [callee.name=$], [callee.name=$$], [callee.name=observe], [callee.property.name=querySelector], [callee.property.name=querySelectorAll], [callee.property.name=closest])[arguments.0.value=/,/][arguments.0.value.length>=20]:not([arguments.0.value=/:has|:is/])',
					message: 'Instead of a single string, pass an array of selectors and add comments to each selector',
				},
				{
					selector:
						':matches([callee.name=delegate], [callee.name=$], [callee.name=$$], [callee.name=observe], [callee.property.name=querySelector], [callee.property.name=querySelectorAll], [callee.property.name=closest])[arguments.0.type=ArrayExpression][arguments.0.elements.length=1]:not([arguments.0.value=/:has|:is/])',
					message: 'Instead of a single string, pass an array of selectors and add comments to each selector',
				},
			],
			'jsx-quotes': [
				'error',
				'prefer-double',
			],
			'no-alert': 'off',
			'no-warning-comments': 'off',
			'unicorn/no-nested-ternary': 'off',
			'unicorn/better-regex': 'off',
			'unicorn/prefer-top-level-await': 'off',
			'unicorn/prefer-dom-node-dataset': 'off',
			'unicorn/prevent-abbreviations': [
				'error',
				{
					replacements: {
						props: false,
						ref: false,
						nav: false,
					},
				},
			],
			'ts/naming-convention': 'off',
			'ts/no-implicit-any-catch': 'off',
			'ts/no-unsafe-assignment': 'off',
			'ts/no-unsafe-argument': 'off',
			'ts/no-unsafe-member-access': 'off',
			'ts/no-unsafe-return': 'off',
			'ts/no-unsafe-call': 'off',
			'ts/consistent-type-imports': 'off',
			'n/prefer-global/process': 'off',
			'import/no-cycle': 'off',
			'import/no-unassigned-import': 'off',
			'import/prefer-default-export': 'error',
			'import/order': [
				'error',
				{
					'groups': [
						[
							'builtin',
							'external',
						],
					],
					'newlines-between': 'always-and-inside-groups',
				},
			],
			// TODO: Enable after https://github.com/Rel1cx/eslint-react/issues/739
			// "react/function-component-definition": [
			// 	"error",
			// 	{
			// 		"namedComponents": "function-declaration"
			// 	}
			// ]
		},
	},

	{
		files: [
			'build/*',
		],
		rules: {
			'ts/triple-slash-reference': 'off',
			'unicorn/prefer-module': 'off',
		},
	},
	{
		files: [
			'source/features/*',
		],
		rules: {
			'import/prefer-default-export': 'off',
		},
	},
	{
		files: [
			'**/*.md',
		],
		rules: {
			'style/no-multiple-empty-lines': 'off',
		},
	},
	// https://eslint.org/docs/latest/use/configure/ignore#ignoring-files
	{
		ignores: ['safari'],
	},
);
