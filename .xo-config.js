module.exports = {
	quiet: true,
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
		'import/no-unassigned-import': 'off',
		'no-alert': 'off',
		'no-void': 'off',
		'react/jsx-key': 'off',
		'unicorn/no-fn-reference-in-iterator': 'off',
		// Test files are pre-compiled and bundled by rollup
		'ava/no-ignored-test-files': 'off',

		'@typescript-eslint/no-extra-non-null-assertion': 'error',
		'@typescript-eslint/consistent-type-definitions': 'error',
		'@typescript-eslint/explicit-function-return-type': [
			'error',
			{
				allowExpressions: true,
				allowTypedFunctionExpressions: true,
				allowHigherOrderFunctions: true,
				allowConciseArrowFunctionExpressionsStartingWithVoid: false
			}
		],
		'import/first': 'error',
		'import/newline-after-import': 'error',
		'import/no-commonjs': 'error',
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
		'import/prefer-default-export': 'error',
		'react/function-component-definition': [
			'error',
			{
				namedComponents: 'function-declaration'
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
