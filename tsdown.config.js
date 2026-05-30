import { defineConfig } from 'tsdown'

import {string} from 'rollup-plugin-string';
import svelte from 'rollup-plugin-svelte';
import webpackStatsPlugin from 'rollup-plugin-webpack-stats';

import svelteConfig from './svelte.config.js';

const noise = new Set([
	'index',
	'dist',
	'src',
	'source',
	'distribution',
	'node_modules',
	'main',
	'esm',
	'cjs',
	'build',
	'built',
]);

const rollup = {
	entry: {
		options: './source/options.tsx',
		welcome: './source/welcome.svelte',
		graphql: './source/graphql.svelte',
		header: './source/options/header.svelte',
		'storage-usage': './source/options/storage-usage.svelte',
		'version-info': './source/options/version-info.svelte',
		background: './source/background.ts',
		'refined-github': './source/refined-github.ts',
		'content-script': './source/content-script.ts',
	},

  copy: [
    { from: './source/manifest.json', to: 'distribution' },
    { from: './source/*.+(html|png)', to: 'distribution/assets' },
  ],
  deps: {
		// Bundle all dependencies: https://tsdown.dev/options/dependencies#deps-onlybundle
    onlyBundle: false,
  },
	unbundle: true,

  root: 'source',

  inputOptions: {
    resolve: {
      alias: { react: 'dom-chef' },
    },
  },
	outDir: 'distribution/assets',

  outputOptions: {
    entryFileNames(chunkInfo) {
      if (chunkInfo.name.includes('node_modules')) {
        const cleanName = chunkInfo.name
          .split('/')
          .filter(part => !noise.has(part))
          .join('-');
        return `npm/${cleanName}.js`;
      }

      return chunkInfo.name.replace('build/__snapshots__/', '') + '.js';
    },
  },

	// TODO: Drop after https://github.com/sindresorhus/memoize/issues/102
	context: 'globalThis',
	onwarn(warning, defaultHandler) {
		if (
			warning.code === 'CIRCULAR_DEPENDENCY'
			&& warning.ids?.every(id => id.includes('/svelte/'))
		) {
			return;
		}

		defaultHandler(warning);
	},

	plugins: [
		svelte(svelteConfig),
		string({
			include: '**/*.gql',
		}),
	],
};

if (process.env.RELATIVE_CI_STATS) {
	rollup.plugins.push(webpackStatsPlugin());
}

export default defineConfig([rollup]);
