import regexJoin from 'regex-join';
import {existsSync, readdirSync, readFileSync} from 'node:fs';

import {getFeatures, getFeaturesMeta} from './readme-parser.js'; // Must import as `.js`

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
		return `ERR: The feature ${featureId} should be described in the readme`;
	}

	if (featureMeta.description.length < 20) {
		return `ERR: ${featureId} should be described better in the readme (at least 20 characters)`;
	}

	const lineRegex = regexJoin(/^/, `- [](# "${featureId}")`, /(?: 🔥)? (.+)$/gm);
	const imageRegex = regexJoin(`<p><a title="${featureId}"></a> `, /(.+?)\n\t+<p><img src="(.+?)">/);
	const lineMatch = readmeContent.match(lineRegex);
	const imageMatch = readmeContent.match(imageRegex);
	if (
		(lineMatch && lineMatch.length > 1) // If the description occurs more than once in the large list of features
		|| (imageMatch && lineMatch) // If the description appears in both the feature list and the highlighted features section
	) {
		return `ERR: ${featureId} should be described only once in the readme`;
	}
}

const errors = featuresDirContents.map(name => findError(name)).filter(Boolean);
console.error(errors.join('\n'));
process.exitCode = errors.length;
