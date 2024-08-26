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
		rules: {
			'sort-imports': 'off',
			'style/object-curly-spacing': ['error', 'never'],
			'style/semi': ['error', 'always'],
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
			'unicorn/expiring-todo-comments': [
				'warn',
				{
					allowWarningComments: false,
				},
			],
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
			'@typescript-eslint/naming-convention': 'off',
			'@typescript-eslint/no-implicit-any-catch': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-return': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/consistent-type-imports': 'off',
			'@typescript-eslint/explicit-function-return-type': [
				'error',
				{
					allowExpressions: true,
				},
			],
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
			'react/jsx-key': 'off',
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
			'@typescript-eslint/triple-slash-reference': 'off',
			'unicorn/prefer-module': 'off',
		},
	},
	{
		files: [
			'**/*.js',
		],
		rules: {
			'@typescript-eslint/consistent-type-definitions': 'off',
			'@typescript-eslint/explicit-function-return-type': 'off',
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
);
