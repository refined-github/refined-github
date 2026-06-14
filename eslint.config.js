import {includeIgnoreFile} from '@eslint/compat';
import css from '@eslint/css';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import byoPlugin from 'eslint-plugin-byo';
import pluginPromise from 'eslint-plugin-promise';
import sveltePlugin from 'eslint-plugin-svelte';
import {defineConfig} from 'eslint/config';
import globals from 'globals';
import {fileURLToPath} from 'node:url';
import selectDom from 'select-dom/eslint-plugin';
import xo from 'xo';

import refinedGithubPlugin from './eslint-rules/index.js';
import restrictedSyntax from './eslint-rules/restricted-syntax.js';

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));
export default defineConfig([
	includeIgnoreFile(gitignorePath, 'Imported .gitignore patterns'),
	...xo.xoToEslintConfig(),
	{
		ignores: ['**/*.json', '**/*.css'],
		plugins: {
			promise: pluginPromise,
		},
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.webextensions,
			},
		},
		rules: {
			'@stylistic/function-paren-newline': 'off', // Awful
			'@stylistic/jsx-quotes': 'off', // Keep existing quote style in JSX
			'n/prefer-global/process': 'off',
			'no-alert': 'off',
			'no-console': 'off',
			'no-irregular-whitespace': 'off', // We do want to use non-breaking spaces
			'no-warning-comments': 'off', // Noise
			'promise/prefer-await-to-then': ['error', {strict: false}], // Allows `await x.catch()`
			'require-unicode-regexp': 'off', // Too many violations to fix at once; enforce separately
			'unicorn/better-regex': 'off',
			'unicorn/comment-content': 'off', // Troublesome https://github.com/sindresorhus/eslint-plugin-unicorn/pull/3104#issuecomment-4699446150
			'unicorn/dom-node-dataset': 'off',
			'unicorn/no-break-in-nested-loop': 'off', // Don't care
			'unicorn/consistent-class-member-order': 'off', // Bug: https://github.com/sindresorhus/eslint-plugin-unicorn/pull/3226#issuecomment-4702441484
			'unicorn/no-nested-ternary': 'off', // Nesting already helps
			'unicorn/no-this-outside-of-class': 'off', // Simpler than alternatives
			'unicorn/no-unsafe-property-keyword': 'off', // Bug: https://github.com/sindresorhus/eslint-plugin-unicorn/pull/3227#issuecomment-4702450251
			'unicorn/no-unreadable-new-expression': 'off', // Me no like
			'unicorn/no-unsafe-string-replacement': 'off', // TODO
			'unicorn/prefer-dom-node-html-methods': 'off', // No Safari support https://github.com/sindresorhus/eslint-plugin-unicorn/pull/3119#issuecomment-4699490299
			'unicorn/prefer-iterator-to-array': 'off', // TODO: 2027
			'unicorn/prefer-scoped-selector': 'off', // TODO
			'unicorn/prefer-short-arrow-method': 'off', // No like https://github.com/sindresorhus/eslint-plugin-unicorn/pull/3118#issuecomment-4699459112
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

			'no-restricted-imports': ['error', {
				paths: [{
					name: 'clsx',
					importNames: ['clsx'],
					message: "Use default import: import cx from 'clsx'",
				}],
			}],

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
			// Allow empty blocks like `catch {}` or `function noop() {}`
			'@stylistic/curly-newline': ['error', {minElements: 1}],

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

			'@typescript-eslint/switch-exhaustiveness-check': ['error', {
				considerDefaultExhaustiveForUnions: true,
			}],
			'@typescript-eslint/no-use-before-define': 'error',
			'@typescript-eslint/no-deprecated': 'off', // Too noisy for now
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-return': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-unsafe-type-assertion': 'off',
			'@typescript-eslint/strict-void-return': 'off', // Too many violations to fix at once
			'@typescript-eslint/consistent-type-definitions': 'off', // Review later
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
			'**/*.svelte',
		],
		rules: {
			'import-x/prefer-default-export': 'off',
		},
	},
	{
		files: ['**/*.svelte'],
		extends: [sveltePlugin.configs['flat/recommended']],
		languageOptions: {
			parserOptions: {
				parser: '@typescript-eslint/parser',
			},
		},
	},
	{
		ignores: ['**/*.json'],
		plugins: {
			byo: byoPlugin,
			'refined-github': refinedGithubPlugin,
			'select-dom': selectDom,
		},
		rules: {
			...restrictedSyntax,

			'select-dom/prefer': ['error', {
				allowReadabilityExceptions: true,
			}],
		},
	},
	{
		files: ['source/features/**'],
		rules: {
			'refined-github/no-optional-chaining': 'error',
			'unicorn/no-top-level-side-effects': 'off', // Incompatible with the features that export helpers
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
		files: ['**/*.js', '**/*.ts', '**/*.svelte'],
		...eslintConfigPrettier,
	},
	{
		ignores: ['safari', '**/*.md', '**/*.json', '!**/package.json'],
	},
]);
