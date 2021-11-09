import regexJoin from 'regex-join';
import { existsSync, readdirSync, readFileSync } from 'node:fs';

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

	const featureId = filename.replace('.tsx', '');
	if (!importedFeatures.includes(featureId as FeatureID)) {
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

	// eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
	// This returns one match for every description it finds in the feature list
	const featureMatch = readmeContent.match(findFeatureRegex(featureId as FeatureID));
	// eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
	// This returns three matches for every description in the highlights section
	const highlightedFeatureMatch = readmeContent.match(findHighlightedFeatureRegex(featureId as FeatureID));
	if (
		(featureMatch?.length ?? 0) > 1 // If the description occurs more than once in the large list of features
		|| (highlightedFeatureMatch?.length ?? 0) > 3 // If the description occurs more than once in the list of highlighted features
		|| ((featureMatch?.length ?? 0) + (highlightedFeatureMatch?.length ?? 0) > 3) // If the description appears in both the feature list and the highlighted features section
	) {
		const matches = readmeContent.split(/\r?\n/).map((lineContent: string, lineNumber: number) =>
		findFeatureRegex(featureId as FeatureID).test(lineContent)
			|| regexJoin(`<p><a title="${featureId}"></a> `).test(lineContent)
			? lineNumber + 1 : -1,
		).filter(lineNumber => lineNumber > 0);
		
		return `ERR: ${featureId} is described more than once in the readme on lines ${matches.join(', ')}`;
	}
}

const errors = featuresDirContents.map(name => findError(name)).filter(Boolean);
console.error(errors.join('\n'));
process.exitCode = errors.length;
