#!/usr/bin/env -S TS_NODE_PROJECT=./build/tsconfig.json node --loader ts-node/esm

import {readdirSync} from 'node:fs';

import {getFeaturesMeta, getImportedFeatures} from './readme-parser.js'; // Must import as `.js`

const featuresDirContents = readdirSync('source/features/');
const importedFeatures = getImportedFeatures();
const featuresInReadme = getFeaturesMeta();

const errors: string[] = [];

for (let fileName of featuresDirContents) {
	if (fileName === 'index.tsx' || fileName.endsWith('.css') || fileName.startsWith('rgh-')) {
		continue;
	}

	if (!fileName.endsWith('.tsx')) {
		errors.push(`fileext: The \`/source/features\` folder should only contain .css and .tsx files. File \`${fileName}\` violates that rule.`);
		continue;
	}

	fileName = fileName.replace('.tsx', '');

	const featureMeta = featuresInReadme.find(feature => feature.id === fileName);
	if (!featureMeta) {
		errors.push(`readme: The feature ${fileName} is not included in the readme.`);
		continue;
	}

	if (featureMeta.description.length < 20) {
		errors.push(`desc: The description for ${featureMeta.id} is less than 20 characters. Try explaining it better!`);
	}

	if (!importedFeatures.includes(featureMeta.id)) {
		errors.push(`import: The feature ${featureMeta.id} has not been imported in \`/sources/refined-github.ts\`.`);
	}
}

for (const error of errors) {
	console.error('ERR:', error);
}

process.exitCode = errors.length;
