import {test, expect, describe, assert, vi} from 'vitest';
import {existsSync, readdirSync, readFileSync} from 'node:fs';
import regexJoin from 'regex-join';

import {isFeaturePrivate} from '../source/helpers/feature-utils.js';
import {getImportedFeatures, getFeaturesMeta} from './readme-parser.js';

const entryPoint = 'source/refined-github.ts';
const entryPointSource = readFileSync(entryPoint);
const importedFeatures = getImportedFeatures();
const featuresInReadme = getFeaturesMeta();

// We used to enforce the filetype, but this is no longer possible with new URLs
// https://github.com/refined-github/refined-github/pull/7130
const imageRegex = /\.(png|gif)$/;

const rghUploadsRegex = /refined-github[/]refined-github[/]assets[/]/;

const screenshotRegex = regexJoin(imageRegex, /|/, rghUploadsRegex);

function validateCss(filename: string): string | void {
	const isImportedByEntrypoint = entryPointSource.includes(`import './features/${filename}';`);
	const correspondingTsxFile = `source/features/${filename.replace(/.css$/, '.tsx')}`;
	if (existsSync(correspondingTsxFile)) {
		assert(
			readFileSync(correspondingTsxFile).includes(`import './${filename}';`),
			`Should be imported by \`${correspondingTsxFile}\``,
		);

		assert(
			!isImportedByEntrypoint,
			`Should only be imported by \`${correspondingTsxFile}\`, not by \`${entryPoint}\``,
		);

		return;
	}

	assert(
		isImportedByEntrypoint,
		`Should be imported by \`${entryPoint}\` or removed if it is not needed`,
	);
}

function validateGql(filename: string): string | void {
	const basename = filename.replace('.gql', '');
	const featureId = importedFeatures.find(featureId => basename.startsWith(featureId));
	assert(featureId, `${filename} doesn’t match any existing features. The filename should match the feature that uses it.`);

	const correspondingTsxFile = `source/features/${featureId}.tsx`;
	assert(
		readFileSync(correspondingTsxFile).includes(`from './${filename}';`),
		`Should be imported by \`${correspondingTsxFile}\``,
	);
}

function validateReadme(featureId: FeatureID): string | void {
	const [featureMeta, duplicate] = featuresInReadme.filter(feature => feature.id === featureId);
	assert(featureMeta, 'Should be described in the readme');

	assert(
		featureMeta.description.length >= 20,
		'Should be described better in the readme (at least 20 characters)',
	);

	assert(
		!featureMeta.screenshot || screenshotRegex.test(featureMeta.screenshot),
		'Should have a screenshot (png/gif) in the readme',
	);

	assert(!duplicate, 'Should be described only once in the readme');
}

function validateTsx(filename: string): string | void {
	const featureId = filename.replace('.tsx', '') as FeatureID;
	assert(
		importedFeatures.includes(featureId),
		`Should be imported by \`${entryPoint}\``,
	);

	const fileContents = readFileSync(`source/features/${filename}`);

	if (fileContents.includes('.addCssFeature')) {
		assert(
			!fileContents.includes('.add('),
			`${featureId} should use either \`addCssFeature\` or \`add\`, not both`,
		);

		const correspondingCssFile = `source/features/${filename.replace(/.tsx$/, '.css')}`;
		assert(
			existsSync(correspondingCssFile),
			`${featureId} uses \`.addCssFeature\`, but ${correspondingCssFile} is missing`,
		);

		assert(
			readFileSync(correspondingCssFile).includes(`[rgh-${featureId}]`),
			`${correspondingCssFile} should contain a \`[rgh-${featureId}]\` selector`,
		);
	}

	if (!isFeaturePrivate(filename)) {
		validateReadme(featureId);
	}
}

describe('features', async () => {
	const featuresDirContents = readdirSync('source/features/');
	test.each(featuresDirContents)('%s', filename => {
		// TODO: Replace condition with "is gitignored"
		if (filename === '.DS_Store') {
			return;
		}

		if (filename.endsWith('.gql')) {
			validateGql(filename);
			return;
		}

		if (filename.endsWith('.css')) {
			validateCss(filename);
			return;
		}

		if (filename.endsWith('.tsx')) {
			validateTsx(filename);
			return;
		}

		assert.fail(`The \`/source/features\` folder should only contain .css, .tsx and .gql files. Found \`source/features/${filename}\``);
	});
});
