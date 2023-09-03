import {existsSync, readdirSync, readFileSync} from 'node:fs';

import {isFeaturePrivate} from '../source/helpers/feature-utils.js';
import {getImportedFeatures, getFeaturesMeta} from './readme-parser.js';

const featuresDirContents = readdirSync('source/features/');
const entryPoint = 'source/refined-github.ts';
const entryPointSource = readFileSync(entryPoint);
const importedFeatures = getImportedFeatures();
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
	// TODO: Replace second condition with "is gitignored"
	if (filename === 'index.tsx' || filename === '.DS_Store' || filename.endsWith('.gql')) {
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

	const fileContents = readFileSync(filename);

	if (fileContents.includes('.addCssFeature')) {
		if (fileContents.includes('.add(')) {
			return 'ERR: Use `addCssFeature` or `add`, not both';
		}

		const correspondingCssFile = `source/features/${filename.replace(/.tsx$/, '.css')}`;
		if (!existsSync(correspondingCssFile)) {
			return `ERR: The feature uses \`.addCssFeature\`, but ${correspondingCssFile} is missing`;
		}
	}

	// The previous checks apply to RGH features, but the next ones don't
	if (isFeaturePrivate(filename)) {
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
