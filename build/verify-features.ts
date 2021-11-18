import {existsSync, readdirSync, readFileSync} from 'node:fs';

import {findFeatureRegex, findHighlightedFeatureRegex, getFeatures, getFeaturesMeta} from './readme-parser.js'; // Must import as `.js`

const featuresDirContents = readdirSync('source/features/');
const entryPoint = 'source/refined-github.ts';
const entryPointSource = readFileSync(entryPoint);
const readmeContent = readFileSync('readme.md', 'utf-8');
const importedFeatures = getFeatures();
const featuresInReadme = getFeaturesMeta();

function findCssFileError(filename: string): string | void {
	const isImportedByEntrypoint = entryPointSource.includes(`import './features/${filename}';`);
	const correspondingTsxFile = `source/features/${filename.replace(/.css$/, '.tsx')}`;
	if (existsSync(correspondingTsxFile)) {
		if (!readFileSync(correspondingTsxFile).includes(`import './${filename}';`)) {
			return `ERR: \`${filename}\` should be imported by \`${correspondingTsxFile}\``;
		}

		if (isImportedByEntrypoint) {
			return `ERR: \`${filename}\` should only be imported by \`${correspondingTsxFile}\`, not by \`${entryPoint}\``;
		}

		return;
	}

	if (!isImportedByEntrypoint) {
		return `ERR: \`${filename}\` should be imported by \`${entryPoint}\` or removed if it is not needed`;
	}
}

function findError(filename: string): string | void {
	if (filename === 'index.tsx') {
		return;
	}

	if (filename.endsWith('.css')) {
		return findCssFileError(filename);
	}

	if (!filename.endsWith('.tsx')) {
		return `ERR: The \`/source/features\` folder should only contain .css and .tsx files. File \`${filename}\` violates that rule`;
	}

	const featureId = filename.replace('.tsx', '') as FeatureID;
	if (!importedFeatures.includes(featureId)) {
		return `ERR: ${featureId} should be imported by \`${entryPoint}\``;
	}

	// The previous checks apply to RGH features, but the next ones don't
	if (filename.startsWith('rgh-')) {
		return;
	}

	const featureMeta = featuresInReadme.find(feature => feature.id === featureId);
	if (!featureMeta) {
		return `ERR: ${featureId} should be described in the readme`;
	}

	if (featureMeta.description.length < 20) {
		return `ERR: ${featureId} should be described better in the readme (at least 20 characters)`;
	}

	const highlightedFeatureRegex = findHighlightedFeatureRegex(featureId);
	let isHighlightedFeature = false;
	if (highlightedFeatureRegex.test(readmeContent)) {
		isHighlightedFeature = true;
	}

	let duplicates = 0;
	let highlightedFeatureMatch;
	do {
		highlightedFeatureMatch = highlightedFeatureRegex.exec(readmeContent);
		if (highlightedFeatureMatch) {
			duplicates++;
		}
	} while (highlightedFeatureMatch);

	if (duplicates > 0) {
		return `ERR: ${featureId} should be described only once in the readme`;
	}

	let occurrences = 0;
	const featureRegex = findFeatureRegex(featureId);
	let listedFeatureMatch;
	do {
		listedFeatureMatch = featureRegex.exec(readmeContent);
		if (listedFeatureMatch) {
			occurrences++;
		}
	} while (listedFeatureMatch);

	if (isHighlightedFeature && occurrences > 0) {
		return `ERR: ${featureId} should be described only once in the readme`;
	}

	if (!isHighlightedFeature && occurrences > 1) {
		return `ERR: ${featureId} should be described only once in the readme`;
	}
}

const errors = featuresDirContents.map(name => findError(name)).filter(Boolean);
console.error(errors.join('\n'));
process.exitCode = errors.length;
