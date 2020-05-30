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
		'@typescript-eslint/no-empty-function': 'off',
		'@typescript-eslint/no-floating-promises': 'off',
		'@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
		'@typescript-eslint/prefer-readonly-parameter-types': 'off',
		'no-alert': 'off',
		'no-void': 'off',
		'react/function-component-definition': [
			'error',
			{
				namedComponents: 'function-declaration'
			}
		],
		'react/jsx-first-prop-new-line': 'error',
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
		'import/no-anonymous-default-export': 'error',
		'import/no-commonjs': 'error',
		'import/no-named-default': 'error',
		'import/no-unassigned-import': 'off',
		'import/prefer-default-export': 'error',
		'import/extensions': [
			'error',
			'never',
			{
				svg: 'always'
			}
		],
		'unicorn/no-fn-reference-in-iterator': 'off'
	},
	settings: {
		react: {
			version: '16.3'
		}
	}
};
