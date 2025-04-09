import {existsSync, readdirSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {test, describe, assert} from 'vitest';
import {regexJoinWithSeparator} from 'regex-join';
import fastIgnore from 'fast-ignore';

import {isFeaturePrivate} from '../source/helpers/feature-utils.js';
import {getImportedFeatures, getFeaturesMeta} from './readme-parser.js';

// Re-run tests when these files change https://github.com/vitest-dev/vitest/discussions/5864
void import.meta.glob([
	'../source/features/*.*',
	'../source/refined-github.ts',
]);

const isGitIgnored = fastIgnore(readFileSync('.gitignore', 'utf8'));

const noScreenshotExceptions = new Set([
	// Only add feature here if it's a shortcut only and/or extremely clear by name or description
	'sort-conversations-by-update-time',
	'prevent-pr-merge-panel-opening',
	'command-palette-navigation-shortcuts',
	'copy-on-y',
	'create-release-shortcut',
	'pagination-hotkey',
	'profile-hotkey',
	'repo-wide-file-finder',
	'select-all-notifications-shortcut',
	'selection-in-new-tab',
	'click-outside-modal',
	'same-page-links',

	'hide-navigation-hover-highlight', // TODO: Add side-by-side gif
	'hide-inactive-deployments', // TODO: side-by-side png
	'esc-to-deselect-line', // TODO Add gif with key overlay
	'scrollable-areas', // TODO: Add side-by-side png
]);

const entryPoint = 'source/refined-github.ts';
const entryPointSource = readFileSync(entryPoint);
const importedFeatures = getImportedFeatures();
const featuresInReadme = getFeaturesMeta();

// We used to enforce the filetype, but this is no longer possible with new URLs
// https://github.com/refined-github/refined-github/pull/7130
const imageRegex = /\.(png|gif)$/;

const rghUploadsRegex = /refined-github[/]refined-github[/]assets[/]/;

const userAttachmentsRegex = /user-attachments[/]assets[/]/;

const screenshotRegex = regexJoinWithSeparator('|', [imageRegex, rghUploadsRegex, userAttachmentsRegex]);

class FeatureFile {
	readonly id: FeatureID;
	readonly path: string;
	constructor(readonly name: string) {
		this.id = path.parse(name).name as FeatureID;
		this.path = path.join('source/features', name);
	}

	exists(): boolean {
		return existsSync(this.path);
	}

	// eslint-disable-next-line node/prefer-global/buffer, ts/no-restricted-types -- Just passing it
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

	if (/--[\w-]*color[\w-]*/i.test(file.contents().toString())) {
		assert(
			file.contents().includes('fuchsia'),
			'Color variable should always have fuchsia as a fallback, like `color: var(--color, fuchsia);`',
		);
	}

	if (!file.tsx.exists()) {
		assert(
			isImportedByEntrypoint,
			`Should be imported by \`${entryPoint}\` or removed if it is not needed`,
		);

		assert(/test url/i.test(file.contents().toString()), 'Should have test URLs');
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

	assert(!/test url/i.test(file.contents().toString()), 'Only TSX files and *lone* CSS files should have test URLs');
}

function validateGql(file: FeatureFile): void {
	assert(
		file.tsx.exists(),
		'Does not match any existing features. The filename should match the feature that uses it.',
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
		screenshotRegex.test(featureMeta.screenshot!)
		|| noScreenshotExceptions.has(featureId),
		'Should have a screenshot (png/gif) in the readme, unless really difficult to demonstrate (to be discussed in review)',
	);

	assert(!duplicate, 'Should be described only once in the readme');
}

function validateTsx(file: FeatureFile): void {
	assert(
		importedFeatures.includes(file.id),
		`Should be imported by \`${entryPoint}\``,
	);

	assert(/test url/i.test(file.contents().toString()), 'Should have test URLs');

	if (/api\.v4|getDefaultBranch|getPrInfo/.test(String(file.contents())) && /observe\(|delegate\(/.test(String(file.contents()))) {
		assert(
			/await expectToken|hasToken/.test(String(file.contents())),
			`${file.id} uses the v4 API, so it should include \`await expectToken()\` in its init function or, if the token is optional, \`hasToken\` anywhere`,
		);
	}
	if (file.contents().includes('.addCssFeature')) {
		assert(
			!file.contents().includes('.add('),
			`${file.id} should use either \`addCssFeature\` or \`add\`, not both`,
		);

		assert(
			file.css.exists(),
			`${file.id} uses \`.addCssFeature\`, but ${file.css.name} is missing`,
		);

		assert(
			file.css.contents().includes(`html:not([rgh-OFF-${file.id}])`),
			`${file.css.name} should contain a \`html:not([rgh-OFF-${file.id}])\` selector`,
		);
	}

	if (file.contents().includes('deduplicate:')) {
		assert(
			!file.contents().includes('observe('),
			`${file.id} should not use both "deduplicate" and "observe()", the observer already takes care of deduplication`,
		);

		if (file.contents().includes('delegate(')) {
			assert(
				!file.contents().includes('(signal: AbortSignal)'),
				`${file.id} should not use "deduplicate" and "delegate()" together with an abort signal, or else the event listener might be removed and not restored due to the deduplicator https://github.com/refined-github/refined-github/issues/5871`,
			);
		}
	}

	if (!isFeaturePrivate(file.name)) {
		validateReadme(file.id);
	}
}

describe('features', () => {
	const featuresDirectoryContents = readdirSync('source/features/');
	test.each(featuresDirectoryContents)('%s', (filename: string) => {
		if (isGitIgnored(filename)) {
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
