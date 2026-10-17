import {svelte} from '@sveltejs/vite-plugin-svelte';
import browserslist from 'browserslist';
import {browserslistToTargets, Features} from 'lightningcss';
import process from 'node:process';
import webpackStatsPlugin from 'rollup-plugin-webpack-stats';
import {type Plugin} from 'vite';
import {viteStaticCopy} from 'vite-plugin-static-copy';
import svgr from 'vite-plugin-svgr';
import {defineConfig} from 'vitest/config';

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

/** Import `.gql` files as strings */
function gqlAsString(): Plugin {
	return {
		name: 'gql-as-string',
		transform: (code, id) => id.endsWith('.gql') ? `export default ${JSON.stringify(code)};` : undefined,
	};
}

/** CSS is bundled by separate builds (`--mode css-<entry>`), so that the JS can keep `preserveModules` */
function stripCss(): Plugin {
	return {
		name: 'strip-css',
		enforce: 'pre',
		load: id => /\.css(?:\?|$)/.test(id) ? {code: '', moduleSideEffects: false, moduleType: 'js'} : undefined,
		generateBundle(_, bundle) {
			for (const fileName of Object.keys(bundle)) {
				if (fileName.endsWith('.css')) {
					// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
					delete bundle[fileName];
				}
			}
		},
	};
}

/** Only keep the CSS, the JS comes from the main build */
function onlyCss(): Plugin {
	return {
		name: 'only-css',
		generateBundle(_, bundle) {
			for (const [fileName, file] of Object.entries(bundle)) {
				if (file.type === 'chunk') {
					// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
					delete bundle[fileName];
				}
			}
		},
	};
}

/** Fail the build immediately on unresolved dependencies, since the extension can't load anything that isn't bundled */
function failOnExternalImports(): Plugin {
	return {
		name: 'fail-on-external-imports',
		apply: 'build',
		generateBundle(_, bundle) {
			const files = new Set(Object.keys(bundle));
			for (const chunk of Object.values(bundle)) {
				if (chunk.type !== 'chunk') {
					continue;
				}

				for (const id of [...chunk.imports, ...chunk.dynamicImports]) {
					if (!files.has(id)) {
						throw new Error(`Unresolved import "${id}" in ${chunk.fileName}`);
					}
				}
			}
		},
	};
}

const cssEntries: Record<string, string> = {
	options: './source/options.tsx',
	'options-components': './source/options.svelte',
	'refined-github': './source/refined-github.ts',
};

export default defineConfig(({mode}) => {
	// `--mode css-<entry>` builds only the CSS of that entry, so shared CSS isn't split into its own chunk
	const cssEntry = mode.startsWith('css-') ? mode.slice('css-'.length) : undefined;
	return {
		clearScreen: false,
		optimizeDeps: {
			entries: ['source/**/*.test.ts'], // Don't scan the HTML files, they reference built files
		},
		test: {
			environment: 'happy-dom',
			pool: 'vmThreads', // https://vitest.dev/guide/improving-performance#test-environments
			environmentOptions: {
				// eslint-disable-next-line @typescript-eslint/naming-convention
				happyDOM: {
					url: 'https://github.com',
				},
			},
		},
		plugins: [
			gqlAsString(),
			svgr({
				svgrOptions: {
					jsxRuntime: 'classic',
					jsxRuntimeImport: {source: 'dom-chef', defaultSpecifier: 'React'},
					svgo: false,
				},
				oxcOptions: {
					jsx: {
						runtime: 'classic',
						pragma: 'React.createElement',
						pragmaFrag: 'React.Fragment',
					},
				},
			}),
			svelte(),
			...cssEntry
				? [onlyCss()]
				: [
					stripCss(),
					failOnExternalImports(),
					process.env.RELATIVE_CI_STATS ? webpackStatsPlugin() : undefined,
					...viteStaticCopy({
						targets: [
							{src: 'source/manifest.json', dest: '..', rename: {stripBase: true}},
							{src: 'source/*.{html,png,js}', dest: '.', rename: {stripBase: true}},
						],
					}),
				],
		],
		// Match `"jsx": "react"` in tsconfig.json, also for dependencies that ship `.tsx` files
		oxc: {
			jsx: {
				runtime: 'classic',
				pragma: 'React.createElement',
				pragmaFrag: 'React.Fragment',
			},
		},
		resolve: {
			alias: [{find: /^react$/, replacement: 'dom-chef'}],
		},
		css: {
			transformer: 'lightningcss',
			lightningcss: {
				targets: browserslistToTargets(browserslist()),
				include: Features.Nesting,
			},
		},
		base: './',
		build: {
			outDir: 'distribution/assets',
			emptyOutDir: !cssEntry,
			assetsInlineLimit: 0,
			target: 'esnext',
			minify: false,
			cssMinify: false,
			modulePreload: false,
			rolldownOptions: cssEntry
				? {
					input: {[cssEntry]: cssEntries[cssEntry]},
					output: {assetFileNames: '[name][extname]'},
				}
				: {
					input: {
						...cssEntries,
						welcome: './source/welcome.svelte',
						graphql: './source/graphql.svelte',
						'content-script': './source/content-script.ts',
						background: './source/background.ts',
					},
					preserveEntrySignatures: 'strict',
					output: {
						preserveModules: true,
						preserveModulesRoot: 'source',
						entryFileNames(chunkInfo) {
							if (chunkInfo.name.includes('node_modules')) {
								const cleanName = chunkInfo.name
									.split('/')
									.filter(part => !noise.has(part))
									.join('-');
								return `npm/${cleanName}.js`;
							}

							// Drop query strings like `?react`, they're not valid in file names on every OS
							return chunkInfo.name.replace('build/__snapshots__/', '').replace(/\?.*$/, '') + '.js';
						},
					},
				},
		},
	};
});
