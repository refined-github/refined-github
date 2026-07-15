import css from '@eslint/css';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import eslintConfigXo, {jsFilesGlob, tsFilesGlob} from 'eslint-config-xo';
import byoPlugin from 'eslint-plugin-byo';
import sveltePlugin from 'eslint-plugin-svelte';
import {defineConfig, globalIgnores} from 'eslint/config';
import globals from 'globals';
import selectDom from 'select-dom/eslint-plugin';

import refinedGithubPlugin from './eslint-rules/index.js';
import restrictedSyntax from './eslint-rules/restricted-syntax.js';

export default defineConfig([
	globalIgnores(['safari', 'package-lock.json']),
	...eslintConfigXo({
		browser: true,
		gitignore: import.meta.url,
		// TODO: Use after dprint is enabled on TSX files
		// prettier: 'compat',
	}),
	{
		plugins: {
			byo: byoPlugin,
			'refined-github': refinedGithubPlugin,
			'select-dom': selectDom,
		},
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.webextensions,
			},
		},
	},
	{
		files: [tsFilesGlob, jsFilesGlob, '**/*.svelte'],
		rules: {
			...restrictedSyntax,
			'select-dom/prefer': ['error', {
				allowReadabilityExceptions: true,
			}],
			'@stylistic/quotes': ['error', 'single', {avoidEscape: true}],
			'@stylistic/operator-linebreak': 'off', // `dprint` conflict
			'@stylistic/function-paren-newline': 'off', // Awful
			'@stylistic/jsx-quotes': 'off', // Keep existing quote style in JSX
			'no-alert': 'off',
			'no-console': 'off',
			'no-warning-comments': 'off', // Noise
			'require-unicode-regexp': 'off', // Don't care
			'regexp/no-useless-character-class': 'off', // Ugly
			'regexp/no-super-linear-move': 'off', // It is what is is
			'unicorn/consistent-boolean-name': 'off', // Impractical
			'unicorn/dom-node-dataset': 'off',
			'unicorn/max-nested-calls': 'off', // 3 is too low, can't be bothered rn
			'unicorn/no-break-in-nested-loop': 'off', // Don't care
			'unicorn/no-nested-ternary': 'off', // Indentation already helps
			'unicorn/no-this-outside-of-class': 'off', // Simpler than alternatives
			'unicorn/no-unreadable-new-expression': 'off', // Me no like
			'unicorn/no-unsafe-string-replacement': 'off', // Not a real issue
			'unicorn/prefer-dom-node-html-methods': 'off', // TODO: 2027
			'unicorn/prefer-iterator-to-array': 'off', // TODO: 2027
			'unicorn/prefer-short-arrow-method': 'off', // No like https://github.com/sindresorhus/eslint-plugin-unicorn/pull/3118#issuecomment-4699459112
			'unicorn/name-replacements': [
				'error',
				{
					replacements: {
						utils: false,
						props: false,
						ref: false,
						nav: false,
						repository: false, // No https://github.com/sindresorhus/eslint-plugin-unicorn/issues/3404
					},
				},
			],

			// Import-x rules customization
			'import-x/prefer-default-export': 'error',
			'import-x/extensions': 'off', // TODO: https://github.com/xojs/eslint-config-xo/issues/119#issuecomment-4979192969

			// TODO: Probably drop it after moving to dprint
			// Also: https://github.com/un-ts/eslint-plugin-import-x/issues/500
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
	{
		files: ['**/*.ts', '**/*.tsx'],
		rules: {
			// TODO: Drop after moving to dprint
			// Allow empty blocks like `catch {}` or `function noop() {}`
			'@stylistic/curly-newline': ['error', {minElements: 1}],

			// Dprint conflict fixer for the imports
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

			'@typescript-eslint/no-use-before-define': 'error',
			'@typescript-eslint/no-deprecated': 'off', // Reports on JSX type, can never enable
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-return': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-unsafe-type-assertion': 'off',
			'@typescript-eslint/strict-void-return': 'off', // No like
			'@typescript-eslint/strict-boolean-expressions': 'off', // Unnecessarily noisy
			'@typescript-eslint/explicit-function-return-type': [
				'error',
				{
					// Too late to do this manually
					allowExpressions: true,
				},
			],
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
		files: ['source/features/**/*.tsx'],
		rules: {
			'refined-github/no-optional-chaining': 'error',
			'unicorn/no-top-level-side-effects': 'off', // Incompatible with the features that export helpers
			'import-x/prefer-default-export': 'off', // Incompatible with the features that export helpers
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
			'css/no-invalid-properties': ['error', {
				allowUnknownVariables: true,
			}],
			'refined-github/css-require-fuchsia-fallback': 'error',
		},
	},
	{
		files: ['**/package.json'],
		rules: {
			'package-json/no-orphan-types': ['error', {
				'ignore': ['react'],
			}],
		},
	},
	{
		// Dprint doesn't run on tsx files yet, we need to allow style eslint rules
		ignores: [
			'**/*.tsx',
		],
		rules: {
			...eslintConfigPrettier.rules,

			'markdown/no-empty-links': 'off',
			'package-json/require-fields': 'off', // Never needed name and version

			// TODO: Drop after moving to dprint and enabling the global `prettier:compat` option
			// https://github.com/xojs/eslint-config-xo/issues/106
			'@html-eslint/require-closing-tags': 'off',
			'@html-eslint/require-form-method': 'off',
			'@html-eslint/indent': 'off',
			'@html-eslint/attrs-newline': 'off',
			'@html-eslint/element-newline': 'off',
			'@html-eslint/require-content': 'off',
		},
	},
]);
