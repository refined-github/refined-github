import path from 'node:path';
import {readdirSync as readDirSync, readFileSync} from 'node:fs';

import {getFeaturesMeta} from './readme-parser';

const featuresDirContents = readDirSync(path.join(__dirname, '../source/features/'));
const refinedGithubTs = readFileSync(path.join(__dirname, '../source/refined-github.ts')).toString('utf-8');
const featuresInReadme = getFeaturesMeta();

const errors: string[] = [];

for (let fileName of featuresDirContents) {
	if (['css', 'index.tsx'].includes(fileName) || fileName.includes('rgh')) {
		continue;
	}

	if (fileName.endsWith('tsx')) {
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

	if (!refinedGithubTs.includes(featureMeta.id)) {
		errors.push(`import: The feature ${featureMeta.id} has not been imported in \`/sources/refined-github.ts\`.`);
	}
}

if (errors.length > 0) {
	for (const error of errors) {
		console.error('ERR:', error);
	}

	throw new Error('Feature verification failed!');
} else {
	console.info('All features verified!');
}
