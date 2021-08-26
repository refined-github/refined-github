#!/usr/bin/env -S TS_NODE_COMPILER_OPTIONS='{"module":"es2020"}' node --loader ts-node/esm

import {existsSync, readdirSync, readFileSync} from 'node:fs';

import {getFeatures, getFeaturesMeta} from './readme-parser.js'; // Must import as `.js`

const featuresDirContents = readdirSync('source/features/');
const entryPoint = 'source/refined-github.ts';
const entryPointSource = readFileSync(entryPoint);
const importedFeatures = getFeatures();
const featuresInReadme = getFeaturesMeta();

const errors: string[] = [];

function checkIfCssFileIsImported(fileName: string): string | null {
	if (!entryPointSource.includes(`import './features/${fileName}';`)) {
		const correspondingTsxFile = `source/features/${fileName.replace(/.css$/, '.tsx')}`;

		if (existsSync(correspondingTsxFile)) {
			if (!readFileSync(correspondingTsxFile).includes(`import './${fileName}';`)) {
				return `ERR: The file \`${fileName}\` is not imported \`${correspondingTsxFile}\``;
			}
		} else {
			return `ERR: The file \`${fileName}\` is not imported in \`${entryPoint}\``;
		}
	}

	return null;
}

for (const fileName of featuresDirContents) {
	if (fileName === 'index.tsx') {
		continue;
	}

	if (fileName.endsWith('.css')) {
		const error = checkIfCssFileIsImported(fileName);

		if (error) {
			errors.push(error);
		}

		continue;
	}

	if (!fileName.endsWith('.tsx')) {
		errors.push(`ERR: The \`/source/features\` folder should only contain .css and .tsx files. File \`${fileName}\` violates that rule`);
		continue;
	}

	const featureId = fileName.replace('.tsx', '');
	if (!importedFeatures.includes(featureId as FeatureID)) {
		errors.push(`ERR: ${featureId} should be imported by \`${entryPoint}\``);
	}

	if (fileName.startsWith('rgh-')) {
		continue;
	}

	const featureMeta = featuresInReadme.find(feature => feature.id === featureId);
	if (!featureMeta) {
		errors.push(`ERR: The feature ${featureId} should be described in the readme`);
		continue;
	}

	if (featureMeta.description.length < 20) {
		errors.push(`ERR: ${featureId} should be described better in the readme (at least 20 characters)`);
	}
}

console.error(errors.join('\n'));

process.exitCode = errors.length;
