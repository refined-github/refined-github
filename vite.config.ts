import {svelte} from '@sveltejs/vite-plugin-svelte';
import {defineConfig} from 'vite';
import {viteStaticCopy} from 'vite-plugin-static-copy';

import svelteConfig from './svelte.config.js';

export default defineConfig({
	plugins: [
		svelte(svelteConfig),
		viteStaticCopy({
			targets: [
				{src: 'source/manifest.json', dest: '..'},
				{src: 'source/*.{html,png,js}', dest: '.'},
			],
		}),
	],
	resolve: {
		alias: [{find: /^react$/, replacement: 'dom-chef'}],
	},
	build: {
		outDir: 'distribution/assets',
		emptyOutDir: true,
		minify: false,
		modulePreload: false,
		rolldownOptions: {
			input: {
				options: './source/options.tsx',
				'options-components': './source/options.svelte',
				welcome: './source/welcome.svelte',
				graphql: './source/graphql.svelte',
				'refined-github': './source/refined-github.ts',
				'content-script': './source/content-script.ts',
				background: './source/background.ts',
			},
			preserveEntrySignatures: 'strict',
			output: {
				preserveModules: true,
				preserveModulesRoot: 'source',
				entryFileNames: '[name].js',
			},
		},
	},
});
