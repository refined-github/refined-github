module.exports = {
	envs: [
		'browser'
	],
	extends: 'xo-react',
	globals: [
		'browser',
		'__featuresOptionDefaults__',
		'__featuresMeta__',
		'__filebasename'
	],
	rules: {
		'no-alert': 'off',
		'no-void': 'off',

		// Test files are pre-compiled and bundled by rollup
		'ava/no-ignored-test-files': 'off',

		'react/function-component-definition': [
			'error',
			{
				namedComponents: 'function-declaration'
			}
		],
		'react/jsx-key': 'off',
		'import/order': [
			'error',
			{
				groups: [
					[
						'builtin',
						'external'
					]
				],
				'newlines-between': 'always-and-inside-groups'
			}
		],
		'import/first': 'error',
		'import/newline-after-import': 'error',
		'import/no-commonjs': 'error',
		'import/no-unassigned-import': 'off',
		'import/prefer-default-export': 'error',

		'unicorn/no-fn-reference-in-iterator': 'off',
		'@typescript-eslint/no-extra-non-null-assertion': 'error',
		'@typescript-eslint/consistent-type-definitions':'error',
		'@typescript-eslint/require-await': 'error',
		'@typescript-eslint/explicit-function-return-type': [
			'error',
			{
				allowExpressions: true,
				allowTypedFunctionExpressions: true,
				allowHigherOrderFunctions: true,
				allowConciseArrowFunctionExpressionsStartingWithVoid: false
			}
		]
	},
	// We don't use React, so it can't be automatically detected by the linter
	settings: {
		react: {
			version: '16.13'
		}
	}
};
