import {test, describe, assert} from 'vitest';
import {parse, join} from 'node:path';
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

class FeatureFile {
	readonly id: FeatureID;
	readonly path: string;
	constructor(readonly name: string) {
		this.id = parse(name).name as FeatureID;
		this.path = join('source/features', name);
	}

	exists(): boolean {
		return existsSync(this.path);
	}

	// eslint-disable-next-line n/prefer-global/buffer -- Type only
	contents(): Buffer {
		return readFileSync(this.path);
	}

	get tsx(): FeatureFile {
		if (this.name.endsWith('.gql')) {
			const id = importedFeatures.find(featureId => this.id.startsWith(featureId));
			if (id) {
				return new FeatureFile(id + '.tsx');
			}
		}

		return new FeatureFile(this.id + '.tsx');
	}

	get css(): FeatureFile {
		return new FeatureFile(this.id + '.css');
	}
}

function validateCss(file: FeatureFile): void {
	const isImportedByEntrypoint = entryPointSource.includes(`import './features/${file.name}';`);
	if (!file.tsx.exists()) {
		assert(
			isImportedByEntrypoint,
			`Should be imported by \`${entryPoint}\` or removed if it is not needed`,
		);
		return;
	}

	assert(
		file.tsx.contents().includes(`import './${file.name}';`),
		`Should be imported by \`${file.tsx.name}\``,
	);

	assert(
		!isImportedByEntrypoint,
		`Should only be imported by \`${file.tsx.name}\`, not by \`${entryPoint}\``,
	);
}

function validateGql(file: FeatureFile): void {
	assert(
		file.tsx.exists(),
		'Does not match any existing features. The filename should match the feature that uses it.'
	);

	assert(
		file.tsx.contents().includes(`from './${file.name}';`),
		`Should be imported by \`${file.tsx.name}\``,
	);
}

function validateReadme(featureId: FeatureID): void {
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

function validateTsx(file: FeatureFile): void {
	assert(
		importedFeatures.includes(file.id),
		`Should be imported by \`${entryPoint}\``,
	);

	const fileContents = readFileSync(`source/features/${file.name}`);

	if (fileContents.includes('.addCssFeature')) {
		assert(
			!fileContents.includes('.add('),
			`${file.id} should use either \`addCssFeature\` or \`add\`, not both`,
		);

		assert(
			file.css.exists(),
			`${file.id} uses \`.addCssFeature\`, but ${file.css.name} is missing`,
		);

		assert(
			file.css.contents().includes(`[rgh-${file.id}]`),
			`${file.css.name} should contain a \`[rgh-${file.id}]\` selector`,
		);
	}

	if (!isFeaturePrivate(file.name)) {
		validateReadme(file.id);
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
			validateGql(new FeatureFile(filename));
			return;
		}

		if (filename.endsWith('.css')) {
			validateCss(new FeatureFile(filename));
			return;
		}

		if (filename.endsWith('.tsx')) {
			validateTsx(new FeatureFile(filename));
			return;
		}

		assert.fail(`The \`/source/features\` folder should only contain .css, .tsx and .gql files. Found \`source/features/${filename}\``);
	});
});
