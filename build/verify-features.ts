#!/usr/bin/env -S TS_NODE_COMPILER_OPTIONS='{"module":"es2020"}' node --loader ts-node/esm

import {readdirSync} from 'node:fs';

import {getFeatures, getFeaturesMeta} from './readme-parser.js'; // Must import as `.js`

const featuresDirContents = readdirSync('source/features/');
const importedFeatures = getFeatures();
const featuresInReadme = getFeaturesMeta();

const errors: string[] = [];

for (let fileName of featuresDirContents) {
	if (fileName === 'index.tsx' || fileName.endsWith('.css') || fileName.startsWith('rgh-')) {
		continue;
	}

	if (!fileName.endsWith('.tsx')) {
		errors.push(`ERR: The \`/source/features\` folder should only contain .css and .tsx files. File \`${fileName}\` violates that rule.`);
		continue;
	}

	fileName = fileName.replace('.tsx', '');

	const featureMeta = featuresInReadme.find(feature => feature.id === fileName);
	if (!featureMeta) {
		errors.push(`ERR: The feature ${fileName} should be described in the readme.`);
		continue;
	}

	if (featureMeta.description.length < 20) {
		errors.push(`ERR: ${fileName} should be described better in the readme (at least 20 characters)`);
	}

	if (!importedFeatures.includes(featureMeta.id)) {
		errors.push(`ERR: ${fileName} should be imported by \`/sources/refined-github.ts\`.`);
	}
}

console.error(errors.join('\n'));

process.exitCode = errors.length;
