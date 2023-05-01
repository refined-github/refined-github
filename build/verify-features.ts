import {existsSync, readdirSync, readFileSync} from 'node:fs';

import {getImportedFeatures, getFeaturesMeta} from './readme-parser.js'; // Must import as `.js`

const featuresDirContents = readdirSync('source/features/');
const entryPoint = 'source/refined-github.ts';
const entryPointSource = readFileSync(entryPoint);
const cssEntryPoint = 'source/refined-github.css';
const cssEntryPointSource = readFileSync(cssEntryPoint);

const importedFeatures = getImportedFeatures();
const featuresInReadme = getFeaturesMeta();

function findCssFileError(filename: string): string | void {
	const isImportedByEntrypoint = entryPointSource.includes(`import './features/${filename}';`);
	const isImportedByCssEntrypoint = cssEntryPointSource.includes(`@import './features/${filename}';`);
	const correspondingTsxFile = `source/features/${filename.replace(/.css$/, '.tsx')}`;

	if (isImportedByEntrypoint) {
		return `ERR: CSS files should only be imported in \`${cssEntryPoint}\`, but \`${filename}\` was found in \`${entryPoint}\``;
	}

	if (existsSync(correspondingTsxFile)) {
		if (!readFileSync(correspondingTsxFile).includes(`import './${filename}';`)) {
			return `ERR: \`${filename}\` should be imported by \`${correspondingTsxFile}\``;
		}

		if (isImportedByCssEntrypoint) {
			return `ERR: \`${filename}\` should only be imported by \`${correspondingTsxFile}\`, not by \`${cssEntryPoint}\``;
		}

		return;
	}

	if (!isImportedByCssEntrypoint) {
		return `ERR: \`${filename}\` should be imported by \`${cssEntryPoint}\` or deleted if it is not needed`;
	}
}

function findError(filename: string): string | void {
	// TODO: Replace second condition with "is gitignored"
	if (filename === 'index.tsx' || filename === '.DS_Store') {
		return;
	}

	if (filename.endsWith('.css')) {
		return findCssFileError(filename);
	}

	if (!filename.endsWith('.tsx')) {
		return `ERR: The \`/source/features\` folder should only contain .css and .tsx files. Found \`source/features/${filename}\``;
	}

	const featureId = filename.replace('.tsx', '') as FeatureID;
	if (!importedFeatures.includes(featureId)) {
		return `ERR: ${featureId} should be imported by \`${entryPoint}\``;
	}

	// The previous checks apply to RGH features, but the next ones don't
	if (filename.startsWith('rgh-')) {
		return;
	}

	const [featureMeta, duplicate] = featuresInReadme.filter(feature => feature.id === featureId);
	if (!featureMeta) {
		return `ERR: ${featureId} should be described in the readme`;
	}

	if (featureMeta.description.length < 20) {
		return `ERR: ${featureId} should be described better in the readme (at least 20 characters)`;
	}

	if (featureMeta.screenshot && !/\.(png|gif)$/.test(featureMeta.screenshot)) {
		return `ERR: ${featureId} should have a screenshot (png/gif) in the readme`;
	}

	if (duplicate) {
		return `ERR: ${featureId} should be described only once in the readme`;
	}
}

const errors = featuresDirContents.map(name => findError(name)).filter(Boolean);
console.error(errors.join('\n'));
process.exitCode = errors.length;
