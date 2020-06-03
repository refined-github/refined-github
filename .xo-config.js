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
		'import/extensions': [
			'error',
			'never',
			{
				svg: 'always'
			}
		],

		// Temporarily disabled
		'@typescript-eslint/no-invalid-void-type': 'off',
		'@typescript-eslint/no-extra-non-null-assertion': 'off',
		'@typescript-eslint/no-unnecessary-condition': 'off',
		'@typescript-eslint/no-floating-promises': 'off',
		'unicorn/no-fn-reference-in-iterator': 'off',
		'unicorn/no-reduce': 'off' // TODO: Remove `reduce` usage.
	},
	settings: {
		react: {
			version: '16.3'
		}
	}
};
