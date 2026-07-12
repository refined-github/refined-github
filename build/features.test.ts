import fastIgnore from 'fast-ignore';
import {existsSync, readdirSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {regexJoinWithSeparator} from 'regex-join';
import {assert, describe, test} from 'vitest';

import {isFeaturePrivate} from '../source/helpers/feature-utils.js';
import {getFeaturesMeta, getImportedFeatures} from './readme-parser.js';

// Re-run tests when these files change https://github.com/vitest-dev/vitest/discussions/5864
void import.meta.glob([
	'../source/features/*.*',
	'../source/refined-github.ts',
]);

const isGitIgnored = fastIgnore(readFileSync('.gitignore', 'utf8'));

const noScreenshotExceptions = new Set([
	// Only add feature here if it's a shortcut only and/or extremely clear by name or description
	'last-update-sort',
	'create-release-shortcut',
	'profile-hotkey',
	'repo-wide-file-finder',
	'select-all-notifications-shortcut',
	'rerun-workflow',
	'selection-in-new-tab',
	'click-outside-modal',
	'same-page-links',
	'github-bugs',
	'tab-size',
	'monospace-textareas',
	'new-tab-links',
	'extensible-nav', // No visual or behavior change

	'hide-navigation-hover-highlight', // TODO: Add side-by-side GIF
	'hide-inactive-deployments', // TODO: side-by-side PNG
	'esc-to-deselect-line', // TODO Add GIF with key overlay
	'scrollable-areas', // TODO: Add side-by-side PNG

	// CSS-only features without screenshots yet
	'reactions-popup',
	'clean-checks-list',
	'clean-footer',
	'clean-notifications',
	'mark-private-repos',
	'mobile-tabs-pr',
	'night-not-found',
	'readable-title-change-events',
	'sticky-csv-header',
	'sticky-file-header',
]);

const entryPoint = 'source/refined-github.ts';
const entryPointSource = readFileSync(entryPoint);
const importedFeatures = getImportedFeatures();
const featuresInReadme = getFeaturesMeta();

// We used to enforce the filetype, but this is no longer possible with new URLs
// https://github.com/refined-github/refined-github/pull/7130
const imageRegex = /\.(?:png|gif)$/;

const rghUploadsRegex = /refined-github[/]refined-github[/]assets[/]/;

const userAttachmentsRegex = /user-attachments[/]assets[/]/;

const screenshotRegex = regexJoinWithSeparator('|', [imageRegex, rghUploadsRegex, userAttachmentsRegex]);

class FeatureFile {
	readonly id: FeatureId;
	readonly path: string;
	readonly name: string;
	constructor(name: string) {
		this.name = name;
		this.id = path.parse(name).name as FeatureId;
		this.path = path.join('source/features', name);
	}

	exists(): boolean {
		return existsSync(this.path);
	}

	contents(): string {
		return readFileSync(this.path, 'utf8');
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

	get svelte(): FeatureFile {
		return new FeatureFile(this.id + '.svelte');
	}
}

function validateReadme(featureId: FeatureId): void {
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

function validateCss(file: FeatureFile): void {
	const isImportedByEntrypoint = entryPointSource.includes(`import './features/${file.name}';`);

	if (!file.tsx.exists()) {
		assert(
			isImportedByEntrypoint,
			`Should be imported by \`${entryPoint}\` or removed if it is not needed`,
		);

		// `github-bugs` has its own ESLint rule for test URLs
		if (file.id !== 'github-bugs') {
			assert(/test url/i.test(file.contents()), 'Should have test URLs');
		}

		if (!isFeaturePrivate(file.name)) {
			validateReadme(file.id);
		}

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

	assert(!/test url/i.test(file.contents()), 'Only TSX files and *lone* CSS files should have test URLs');
}

function validateGql(file: FeatureFile): void {
	assert(
		file.tsx.exists(),
		'Does not match any existing features. The filename should match the feature that uses it.',
	);

	assert(
		file.tsx.contents().includes(`from './${file.name}';`)
			|| file.svelte.exists() && file.svelte.contents().includes(`from './${file.name}';`),
		`Should be imported by \`${file.tsx.name}\` or \`${file.svelte.name}\``,
	);
}

function validateTsx(file: FeatureFile): void {
	assert(
		importedFeatures.includes(file.id),
		`Should be imported by \`${entryPoint}\``,
	);

	assert(/test url/i.test(file.contents()), 'Should have test URLs');

	if (
		/api\.v4|getDefaultBranch|getPrInfo/.test(file.contents())
		&& /observe\(|delegate\(/.test(file.contents())
	) {
		assert(
			/requiresToken:\s*true|hasToken/.test(file.contents()),
			`${file.id} uses the v4 API, so it should include \`requiresToken: true\`, or if the token is optional, \`hasToken\` anywhere`,
		);
	}

	if (file.contents().includes('.addCssFeature')) {
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

function validateSvelte(file: FeatureFile): void {
	assert(
		file.tsx.exists(),
		'Does not match any existing features. The filename should match the feature that uses it.',
	);

	assert(
		file.tsx.contents().includes(`from './${file.name}';`),
		`Should be imported by \`${file.tsx.name}\``,
	);
}

describe('features', () => {
	const featuresDirectoryContents = readdirSync('source/features/');
	test.each(featuresDirectoryContents)('%s', (filename: string) => {
		if (isGitIgnored(filename)) {
			return;
		}

		const file = new FeatureFile(filename);

		if (filename.endsWith('.gql')) {
			validateGql(file);
			return;
		}

		if (filename.endsWith('.css')) {
			validateCss(file);
			return;
		}

		if (filename.endsWith('.tsx')) {
			validateTsx(file);
			return;
		}

		if (filename.endsWith('.svelte')) {
			validateSvelte(file);
			return;
		}

		assert.fail(
			`The \`/source/features\` folder should only contain .css, .tsx and .gql files. Found \`source/features/${filename}\``,
		);
	});
});
