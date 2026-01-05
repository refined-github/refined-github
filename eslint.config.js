import xo from 'xo';
import sveltePlugin from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import {includeIgnoreFile} from '@eslint/compat';
import {fileURLToPath} from 'node:url';

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

export default [
	includeIgnoreFile(gitignorePath, 'Imported .gitignore patterns'),
	...xo.xoToEslintConfig([
		{
			semicolon: true,
			prettier: false,
			languageOptions: {
				globals: {
					browser: 'readonly',
				},
			},
			rules: {
				'no-irregular-whitespace': 'off', // We do want to use non-breaking spaces

				// Disable some unicorn rules
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
							utils: false,
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

				'no-console': 'off',
				'@stylistic/jsx-quotes': 'off', // Keep existing quote style in JSX
				'@stylistic/function-paren-newline': 'off', // Allow JSX on separate lines from parens
				'promise/prefer-await-to-then': ['error', {strict: false}], // Allows `await x.catch()`

				// Allow unassigned imports for CSS and feature files
				'import-x/no-unassigned-import': ['error', {
					allow: [
						'**/*.css',
						'**/*.scss',
						'**/*.sass',
						'**/*.less',
						'**/features/**',
						'**/github-helpers/**',
						'webext-bugs/*',
						'vite/client',
						'webext-dynamic-content-scripts',
					],
				}],

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
								':matches([callee.name=delegate], [callee.name=$], [callee.name=$$], [callee.name=$optional], [callee.name=observe], [callee.property.name=querySelector], [callee.property.name=querySelectorAll], [callee.property.name=closest])[arguments.0.value=/,/][arguments.0.value.length>=20]:not([arguments.0.value=/:has|:is/])',
						message: 'Instead of a single string, pass an array of selectors and add comments to each selector',
					},
					{
						selector:
								':matches([callee.name=delegate], [callee.name=$], [callee.name=$$], [callee.name=$optional], [callee.name=observe], [callee.property.name=querySelector], [callee.property.name=querySelectorAll], [callee.property.name=closest])[arguments.0.type=ArrayExpression][arguments.0.elements.length=1]:not([arguments.0.value=/:has|:is/])',
						message: 'If it\'s a single selector, use a single string instead of an array',
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
					{
						message: 'Elements with data-hotkey must have a title or aria-label in the format "Hotkey: <key>"',
						selector:
								'JSXOpeningElement:has(JSXAttribute[name.name="data-hotkey"])'
								+ ':not(:has(JSXAttribute[name.name="title"]))'
								+ ':not(:has(JSXAttribute[name.name="aria-label"]))'
								+ ':not(:has(JSXAttribute[name.name="hidden"]))',
					},
				],
				'no-alert': 'off',
				'n/prefer-global/process': 'off',

				// Import-x rules customization
				'import-x/consistent-type-specifier-style': 'off',
				'import-x/prefer-default-export': 'error',
				'import-x/order': [
					'error',
					{
						groups: [
							[
								'builtin',
								'external',
							],
						],
						'newlines-between': 'always-and-inside-groups',
					},
				],
			},
		},
		// TypeScript-specific config
		{
			files: ['**/*.{ts,tsx,cts,mts}'],
			rules: {
				'@typescript-eslint/no-restricted-types': [
					'error',
					{
						types: {
							object: {
								message: 'The `object` type is hard to use. Use `Record<string, unknown>` instead. See: https://github.com/typescript-eslint/typescript-eslint/pull/848',
								fixWith: 'Record<string, unknown>',
							},
							null: {
								message: 'Use `undefined` instead. See: https://github.com/sindresorhus/meta/issues/7',
								fixWith: 'undefined',
							},
							Buffer: {
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
				'@typescript-eslint/switch-exhaustiveness-check': ['error', {
					considerDefaultExhaustiveForUnions: true,
				}],

				'@typescript-eslint/parameter-properties': 'off', // Conflicts with erasable sintax
				'@typescript-eslint/no-deprecated': 'off', // Too noisy for now
				'@typescript-eslint/no-unsafe-assignment': 'off',
				'@typescript-eslint/no-unsafe-argument': 'off',
				'@typescript-eslint/no-unsafe-member-access': 'off',
				'@typescript-eslint/no-unsafe-return': 'off',
				'@typescript-eslint/no-unsafe-call': 'off',
				'@typescript-eslint/method-signature-style': 'off', // Disagree and it breaks types https://github.com/typescript-eslint/typescript-eslint/issues/1991
				'@typescript-eslint/consistent-type-definitions': 'off', // Review later
				'@typescript-eslint/consistent-type-imports': [
					'error',
					{
						// Preferred style
						fixStyle: 'inline-type-imports',
					},
				],
				'@typescript-eslint/explicit-function-return-type': [
					'error',
					{
						allowExpressions: true,
					},
				],
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
				'source/features/*',
			],
			rules: {
				'import-x/prefer-default-export': 'off',
			},
		},
		{
			files: [
				'**/*.md',
			],
			rules: {
				'unicorn/no-nested-ternary': 'off',
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
				'import-x/prefer-default-export': 'off',
			},
		},
		// Config files can export objects directly
		{
			files: ['*.config.{js,ts}', 'rollup.config.js'],
			rules: {
				'import-x/no-anonymous-default-export': 'off',
			},
		},
		// Test files need browser globals
		{
			files: ['test/**/*.js'],
			languageOptions: {
				globals: {
					document: 'readonly',
					location: 'readonly',
				},
			},
		},
		// https://eslint.org/docs/latest/use/configure/ignore#ignoring-files
		{
			ignores: ['safari'],
		},
	]),
	{
		// Disable on markdown files, which are somehow being read as JS files
		ignores: ['**/*.md'],
	},
	// Svelte support
	...sveltePlugin.configs['flat/recommended'],
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: '@typescript-eslint/parser',
			},
			globals: {
				browser: 'readonly',
				chrome: 'readonly',
				location: 'readonly',
			},
		},
	},
];
