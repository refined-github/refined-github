import antfu from '@antfu/eslint-config';

export default antfu(
	{
		react: true,
		svelte: true,
		stylistic: {
			indent: 'tab',
		},
		unicorn: {
			allRecommended: true,
		},
		globals: [
			'browser',
		],
		typescript: {
			overrides: {
				'ts/method-signature-style': 'off', // Disagree and it breaks types https://github.com/typescript-eslint/typescript-eslint/issues/1991
				'ts/consistent-type-definitions': 'off', // Review later
				'ts/consistent-type-imports': [
					'error',
					{
						// Preferred style
						fixStyle: 'inline-type-imports',
					},
				],
				'ts/explicit-function-return-type': [
					'error',
					{
						allowExpressions: true,
					},
				],
			},
		},
		rules: {
			'react-refresh/only-export-components': 'off', // N/A
			'react/no-missing-key': 'off', // N/A

			'no-irregular-whitespace': 'off', // We do want to use non-breaking spaces
			'jsdoc/check-alignment': 'off', // Not enough to be useful

			// Antfu style disagreements
			'regexp/no-useless-character-class': 'off', // [/] is more readable than \/
			'style/object-curly-spacing': ['error', 'never'], // Unnecessary change for now
			'style/block-spacing': ['error', 'never'], // Same
			'jsonc/array-bracket-spacing': 'off', // Same
			'style/brace-style': ['error', '1tbs'], // Naw, man
			'style/semi': ['error', 'always'],
			'style/member-delimiter-style': ['error', {
				multiline: {
					delimiter: 'semi',
				},
			}],
			'style/arrow-parens': ['error', 'as-needed'],
			'prefer-template': 'off', // When there's a single `+` templates are less readable
			'style/jsx-one-expression-per-line': 'off', // Terrible for inline elements, e.g. text

			//  Disable some unicorn rules
			'unicorn/expiring-todo-comments': 'off', // We just got too many, too much noise
			'unicorn/no-nested-ternary': 'off',
			'unicorn/better-regex': 'off',
			'unicorn/prefer-top-level-await': 'off',
			'unicorn/prefer-dom-node-dataset': 'off',
			'unicorn/prefer-ternary': 'off', // Unreadable https://github.com/sindresorhus/eslint-plugin-unicorn/issues/1633
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

			// Restore errors
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
			'perfectionist/sort-imports': 'off',
			'perfectionist/sort-named-imports': 'off',
			'antfu/top-level-function': 'off', // Maybe later
			'unused-imports/no-unused-vars': 'off', // Buggy
			'no-console': 'off',
			'jsonc/sort-keys': 'off',
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
					},
				},
			],
			'no-restricted-imports': [
				'error',
				{
					paths: [
						{
							name: 'select-dom',
							importNames: ['$', 'expectElement'],
							message: 'Import $ or $optional from `select-dom/strict.js` instead',
						},
					],
				},

			],
			'no-restricted-syntax': [
				'error',
				{
					selector:
						':matches([callee.name=delegate], [callee.name=$], [callee.name=$$], [callee.name=observe], [callee.property.name=querySelector], [callee.property.name=querySelectorAll], [callee.property.name=closest], [callee.property.name=$optional])[arguments.0.value=/,/][arguments.0.value.length>=20]:not([arguments.0.value=/:has|:is/])',
					message: 'Instead of a single string, pass an array of selectors and add comments to each selector',
				},
				{
					selector:
						':matches([callee.name=delegate], [callee.name=$], [callee.name=$$], [callee.name=observe], [callee.property.name=querySelector], [callee.property.name=querySelectorAll], [callee.property.name=closest], [callee.property.name=$optional])[arguments.0.type=ArrayExpression][arguments.0.elements.length=1]:not([arguments.0.value=/:has|:is/])',
					message: 'If it’s a single selector, use a single string instead of an array',
				},
				{
					selector: 'TSNonNullExpression > CallExpression > [name=$optional]',
					message: 'Use `$()` instead of non-null `$optional()`. Use it as `import {expectElement as $}`',
				},
				{
					selector: 'TSNonNullExpression > CallExpression > [name=$]',
					message: 'Unused null expression: !',
				},
				{
					selector: 'MemberExpression[optional=true][object.callee.name=$]',
					message: 'Either use $optional() with `?.` or $() without. $() will throw when the element is not found.',
				},
				{
					message: 'Init functions wrapped with onetime() must have a name ending with "Once"',
					selector: 'ObjectExpression > Property[key.name=init] > CallExpression[callee.name=onetime]:not([arguments.0.name=/Once$/])',
				},
				{
					message: 'Init functions that run once, cannot accept a signal: https://github.com/refined-github/refined-github/pull/8072',
					selector: 'FunctionDeclaration[id.name=/Once$/] > Identifier[name=signal]',
				},
			],
			'no-alert': 'off',
			'ts/no-unsafe-assignment': 'off',
			'ts/no-unsafe-argument': 'off',
			'ts/no-unsafe-member-access': 'off',
			'ts/no-unsafe-return': 'off',
			'ts/no-unsafe-call': 'off',
			'n/prefer-global/process': 'off',
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
	{
		files: [
			'.github/**',
		],
		rules: {
			'unicorn/filename-case': 'off',
		},
	},
	{
		files: [
			'**/*.svelte',
		],
		rules: {
			'import/prefer-default-export': 'off',
			// Until: https://github.com/sveltejs/prettier-plugin-svelte/issues/253
			'svelte/html-quotes': 'off',
		},
	},
	// https://eslint.org/docs/latest/use/configure/ignore#ignoring-files
	{
		ignores: ['safari'],
	},
);
