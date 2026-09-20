import {expect, test} from 'vitest';

import {getFeaturesMeta, getImportedFeatures} from './features-parser.js';

// Re-run tests when these files change https://github.com/vitest-dev/vitest/discussions/5864
void import.meta.glob([
	'../source/features/*',
	'../source/refined-github.ts',
]);

function jsonify(value: unknown): string {
	return JSON.stringify(
		value,
		undefined,
		'\t',
	) + '\n'; // Trailing newline
}

test('features-parser', async () => {
	await expect(jsonify(getImportedFeatures())).toMatchFileSnapshot('./__snapshots__/imported-features.json');
	await expect(jsonify(getFeaturesMeta())).toMatchFileSnapshot('./__snapshots__/features-meta.json');
});
