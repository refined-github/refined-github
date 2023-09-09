import {existsSync, readdirSync, readFileSync} from 'node:fs';

import {isFeaturePrivate} from '../source/helpers/feature-utils.js';
import {getImportedFeatures, getFeaturesMeta} from './readme-parser.js';

const featuresDirContents = readdirSync('source/features/');
const entryPoint = 'source/refined-github.ts';
const entryPointSource = readFileSync(entryPoint);
const importedFeatures = getImportedFeatures();
const featuresInReadme = getFeaturesMeta();

function validateCss(filename: string): string | void {
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

function validateGql(filename: string): string | void {
	const basename = filename.replace('.gql', '');
	const featureId = importedFeatures.find(featureId => basename.startsWith(featureId));
	if (!featureId) {
		return `ERR: ${filename} doesn’t match any existing features. The filename should match the feature that uses it.`;
	}

	const correspondingTsxFile = `source/features/${featureId}.tsx`;
	if (!readFileSync(correspondingTsxFile).includes(`from './${filename}';`)) {
		return `ERR: \`${filename}\` should be imported by \`${correspondingTsxFile}\``;
	}
}

function validateReadme(featureId: FeatureID): string | void {
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

function validateTsx(filename: string): string | void {
	const featureId = filename.replace('.tsx', '') as FeatureID;
	if (!importedFeatures.includes(featureId)) {
		return `ERR: ${featureId} should be imported by \`${entryPoint}\``;
	}

	const fileContents = readFileSync(`source/features/${filename}`);

	if (fileContents.includes('.addCssFeature')) {
		if (fileContents.includes('.add(')) {
			return `ERR: ${featureId} should use either \`addCssFeature\` or \`add\`, not both`;
		}

		const correspondingCssFile = `source/features/${filename.replace(/.tsx$/, '.css')}`;
		if (!existsSync(correspondingCssFile)) {
			return `ERR: ${featureId} uses \`.addCssFeature\`, but ${correspondingCssFile} is missing`;
		}

		if (!readFileSync(correspondingCssFile).includes(`[rgh-${featureId}]`)) {
			return `ERR: ${correspondingCssFile} should contain a \`[rgh-${featureId}]\` selector`;
		}
	}

	if (!isFeaturePrivate(filename)) {
		validateReadme(featureId);
	}
}

function validate(filename: string): string | void {
	// TODO: Replace condition with "is gitignored"
	if (filename === '.DS_Store') {
		return;
	}

	if (filename.endsWith('.gql')) {
		return validateGql(filename);
	}

	if (filename.endsWith('.css')) {
		return validateCss(filename);
	}

	if (filename.endsWith('.tsx')) {
		return validateTsx(filename);
	}

	return `ERR: The \`/source/features\` folder should only contain .css, .tsx and .gql files. Found \`source/features/${filename}\``;
}

const errors = featuresDirContents.map(name => validate(name)).filter(Boolean);
console.error(errors.join('\n'));
process.exitCode = errors.length;
