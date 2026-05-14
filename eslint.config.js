import {includeIgnoreFile} from '@eslint/compat';
import css from '@eslint/css';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import pluginPromise from 'eslint-plugin-promise';
import sveltePlugin from 'eslint-plugin-svelte';
import {defineConfig} from 'eslint/config';
import {fileURLToPath} from 'node:url';
import xo from 'xo';

import cssDocumentation from './eslint-rules/css-documentation.js';
import cssRequireFuchsiaFallback from './eslint-rules/css-require-fuchsia-fallback.js';
import noOptionalChaining from './eslint-rules/no-optional-chaining.js';

import restrictedSyntax from './eslint-rules/restricted-syntax.js';
import selectDomRule from './eslint-rules/select-dom.js';

const refinedGithubPlugin = {
	rules: {
		'select-dom': selectDomRule,
		'no-optional-chaining': noOptionalChaining,
		'css-documentation': cssDocumentation,
		'css-require-fuchsia-fallback': cssRequireFuchsiaFallback,
	},
};

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));
export default defineConfig([
	includeIgnoreFile(gitignorePath, 'Imported .gitignore patterns'),
	...xo.xoToEslintConfig([
		{
			semicolon: true,
			prettier: false,
			plugins: {
				promise: pluginPromise,
			},
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

				'require-unicode-regexp': 'off', // Too many violations to fix at once; enforce separately

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

				'no-restricted-syntax': [
					'error',
					...restrictedSyntax,
				],
				'no-alert': 'off',
				'n/prefer-global/process': 'off',
				'no-use-extend-native/no-use-extend-native': 'off', // False positives on ES2024 static methods (Map.groupBy, Object.groupBy, etc.)

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
				// TODO: Drop after moving to dprint
				// Copied from here, except ImportDeclaration
				// https://github.com/xojs/eslint-config-xo/blob/0e5bd83b1780f3a6a63ae270c3c8ee0ab947cc8f/source/javascript-rules.js#L458
				'@stylistic/object-curly-newline': ['error', {
					ObjectExpression: {
						multiline: true,
						minProperties: 4,
						consistent: true,
					},
					ObjectPattern: {
						multiline: true,
						consistent: true,
					},

					ImportDeclaration: {
						multiline: true,
						minProperties: 10,
						consistent: true,
					},
					ExportDeclaration: {
						multiline: true,
						minProperties: 4,
						consistent: true,
					},
				}],

				'@typescript-eslint/no-restricted-types': [
					'error',
					{
						types: {
							object: {
								message:
									'The `object` type is hard to use. Use `Record<string, unknown>` instead. See: https://github.com/typescript-eslint/typescript-eslint/pull/848',
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
							'[]': "Don't use the empty array type `[]`. It only allows empty arrays. Use `SomeType[]` instead.",
							'[[]]':
								"Don't use `[[]]`. It only allows an array with a single element which is an empty array. Use `SomeType[][]` instead.",
						},
					},
				],
				'@typescript-eslint/switch-exhaustiveness-check': ['error', {
					considerDefaultExhaustiveForUnions: true,
				}],
				'@typescript-eslint/no-use-before-define': 'error',

				'@typescript-eslint/parameter-properties': 'off', // Conflicts with erasable sintax
				'@typescript-eslint/no-deprecated': 'off', // Too noisy for now
				'@typescript-eslint/no-unsafe-assignment': 'off',
				'@typescript-eslint/no-unsafe-argument': 'off',
				'@typescript-eslint/no-unsafe-member-access': 'off',
				'@typescript-eslint/no-unsafe-return': 'off',
				'@typescript-eslint/no-unsafe-call': 'off',
				'@typescript-eslint/no-unsafe-type-assertion': 'off',
				'@typescript-eslint/strict-void-return': 'off', // Too many violations to fix at once
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
		// Other JSON files shouldn't be linted as JS (package.json is handled by xo with json/json language)
		ignores: ['**/*.md', '**/*.json', '!**/package.json'],
	},
	{
		// Allow empty blocks like `catch {}` or `function noop() {}`
		files: ['**/*.{js,jsx,mjs,cjs,ts,tsx,cts,mts,vue,svelte,astro}'],
		rules: {
			'@stylistic/curly-newline': ['error', {minElements: 1}],
		},
	},
	{
		files: ['**/*.svelte'],
		plugins: {svelte: sveltePlugin},
		extends: [sveltePlugin.configs['flat/recommended']],
		languageOptions: {
			parserOptions: {
				parser: '@typescript-eslint/parser',
			},
			globals: {
				browser: 'readonly',
				chrome: 'readonly',
				location: 'readonly',
			},
		},

		// TODO: Use global `/flat` config. Currently limited to svelte files because dprint is applied to their JS
		rules: eslintConfigPrettier.rules,
	},
	{
		plugins: {
			'refined-github': refinedGithubPlugin,
		},
		rules: {
			'refined-github/select-dom': 'error',
		},
	},
	{
		files: ['source/features/**'],
		rules: {
			'refined-github/no-optional-chaining': 'error',
		},
	},
	{
		files: ['source/features/github-bugs.css', 'source/refined-github.css'],
		rules: {
			'refined-github/css-documentation': 'error',
		},
	},
	{
		files: ['**/*.css'],
		language: 'css/css',
		plugins: {css},
		extends: ['css/recommended'],
		languageOptions: {
			tolerant: true, // Required for @container
		},
		rules: {
			'css/no-important': 'off', // Intentionally used to override GitHub styles
			'css/use-baseline': 'off', // We support the latest browsers only
			'css/no-invalid-properties': 'off', // https://github.com/eslint/css/issues/434
			'refined-github/css-require-fuchsia-fallback': 'error',
		},
	},
	{
		files: ['**/*.js', '**/*.ts'],
		// TODO: Use global `/flat` config
		rules: eslintConfigPrettier.rules,
	},
]);
