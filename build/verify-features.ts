#!/usr/bin/env -S TS_NODE_COMPILER_OPTIONS='{"module":"es2020"}' node --loader ts-node/esm

import {existsSync, readdirSync, readFileSync} from 'node:fs';

import {getFeatures, getFeaturesMeta} from './readme-parser.js'; // Must import as `.js`

const featuresDirContents = readdirSync('source/features/');
const entryPoint = 'source/refined-github.ts';
const entryPointSource = readFileSync(entryPoint);
const importedFeatures = getFeatures();
const featuresInReadme = getFeaturesMeta();

function findError(fileName): string | void {
	if (fileName === 'index.tsx') {
		continue;
	}

	if (fileName.endsWith('.css')) {
		const correspondingTsxFile = `source/features/${fileName.replace(/.css$/, '.tsx')}`;
		if (existsSync(correspondingTsxFile) && !readFileSync(correspondingTsxFile).includes(`import './${fileName}';`)) {
			return `ERR: \`${fileName}\` should be imported by \`${correspondingTsxFile}\``;
		}
		
		if (!entryPointSource.includes(`import './features/${fileName}';`)) {
			return `ERR: \`${fileName}\` should be imported by \`${entryPoint}\``;
		}

		return;
	}

	if (!fileName.endsWith('.tsx')) {
		return `ERR: The \`/source/features\` folder should only contain .css and .tsx files. File \`${fileName}\` violates that rule`;
	}

	const featureId = fileName.replace('.tsx', '');
	if (!importedFeatures.includes(featureId as FeatureID)) {
		return `ERR: ${featureId} should be imported by \`${entryPoint}\``;
	}

	if (fileName.startsWith('rgh-')) {
		return;
	}

	const featureMeta = featuresInReadme.find(feature => feature.id === featureId);
	if (!featureMeta) {
		return `ERR: The feature ${featureId} should be described in the readme`;
	}

	if (featureMeta.description.length < 20) {
		return `ERR: ${featureId} should be described better in the readme (at least 20 characters)`;
	}
}

const errors = featuresDirContents.map(name => findError(name)).filter(Boolean);
console.error(errors.join('\n'));
process.exitCode = errors.length;
