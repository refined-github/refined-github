import {test, expect} from 'vitest';

import {
	getFeaturesMeta,
	getImportedFeatures,
} from './readme-parser.js';

// Re-run tests when these files change https://github.com/vitest-dev/vitest/discussions/5864
void import.meta.glob([
	'../readme.md',
	'../source/refined-github.ts',
]);

function jsonify(value: unknown): string {
	return JSON.stringify(
		value,
		undefined,
		'\t',
	) + '\n'; // Trailing newline
}

test('readme-parser', async () => {
	await expect(jsonify(getImportedFeatures())).toMatchFileSnapshot('./__snapshots__/imported-features.json');
	await expect(jsonify(getFeaturesMeta())).toMatchFileSnapshot('./__snapshots__/features-meta.json');
});
