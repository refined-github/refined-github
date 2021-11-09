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

	const lines = [];
	let highlightedFeatureMatch;
	do {
		highlightedFeatureMatch = highlightedFeatureRegex.exec(readmeContent);
		if (highlightedFeatureMatch) {
			lines.push(readmeContent.slice(0, highlightedFeatureMatch.index).split(/\r?\n/).length);
		}
	} while (highlightedFeatureMatch);

	if (lines.length > 0) {
		return `ERR: ${featureId} should be described only once in the readme, but it is also described on line(s) ${lines.join(', ')}`;
	}

	lines.length = 0;
	const featureRegex = findFeatureRegex(featureId);
	let listedFeatureMatch;
	do {
		listedFeatureMatch = featureRegex.exec(readmeContent);
		if (listedFeatureMatch) {
			lines.push(readmeContent.slice(0, listedFeatureMatch.index).split(/\r?\n/).length);
		}
	} while (listedFeatureMatch);

	if (isHighlightedFeature && lines.length > 0) {
		return `ERR: ${featureId} should be described only once in the readme, but it is described in the highlights section and on line(s) ${lines.join(', ')}`;
	}

	if (!isHighlightedFeature && lines.length > 1) {
		return `ERR: ${featureId} should be described only once in the readme, but it is described on lines ${lines.join(', ')}`;
	}
}

const errors = featuresDirContents.map(name => findError(name)).filter(Boolean);
console.error(errors.join('\n'));
process.exitCode = errors.length;
