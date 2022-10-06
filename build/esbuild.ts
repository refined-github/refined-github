import {createRequire} from 'node:module';

import esbuild from 'esbuild';

import {getFeatures, getFeaturesMeta} from './readme-parser.js';

const {resolve: resolvePackage} = createRequire(import.meta.url);

const readmeLoader: esbuild.Plugin = {
	name: 'Readme Loader',
	setup(build) {
		build.onLoad({filter: /readme\.md$/}, () => ({
			contents: `
				export const featureList = ${JSON.stringify(getFeatures())};
				export const featuresMeta = ${JSON.stringify(getFeaturesMeta())};
			`,
			loader: 'js',
		}));
	},
};

void esbuild.build({
	entryPoints: [
		'source/background.ts',
		'source/options.tsx',
		'source/resolve-conflicts.ts',
		'source/refined-github.ts',
	],
	bundle: true,
	watch: process.argv[2] === '--watch',
	outdir: 'distribution/build',
	external: ['chrome:*'],
	plugins: [readmeLoader],
});

void esbuild.build({
	entryPoints: [
		resolvePackage('webextension-polyfill'),
	],
	outdir: 'distribution/build',
});
