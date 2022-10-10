import {createRequire} from 'node:module';

import esbuild from 'esbuild';
import {copy} from 'esbuild-plugin-copy';

import {getImportedFeatures, getFeaturesMeta} from './readme-parser.js';

const {resolve: resolvePackage} = createRequire(import.meta.url);

const readmeLoader: esbuild.Plugin = {
	name: 'Readme Loader',
	setup(build) {
		build.onLoad({filter: /readme\.md$/}, () => ({
			contents: `
				export const importedFeatures = ${JSON.stringify(getImportedFeatures())};
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
	logLevel: 'info',
	watch: process.argv[2] === '--watch',
	outdir: 'distribution',
	external: ['chrome:*'],
	plugins: [readmeLoader, copy({
		assets: [{
			from: ['source/*.+(html|json|png)'],
			to: 'ignored-but-needed🤷‍♂️',
		}],
	})],
});

void esbuild.build({
	entryPoints: [
		resolvePackage('webextension-polyfill'),
	],
	outdir: 'distribution',
});
