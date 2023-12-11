import {test, expect} from 'vitest';

import {
	getFeaturesMeta,
	getImportedFeatures,
} from './readme-parser.js';

test('readme-parser', async () => {
	await expect(getImportedFeatures().join('\n') + '\n')
		.toMatchFileSnapshot('./__snapshots__/imported-features.txt');
	const featuresMetaJson = JSON.stringify(
		getFeaturesMeta(),
		(_, value) => value ?? null, // Convert undefined to null to make them visible in the JSON
		'\t',
	);
	await expect(featuresMetaJson + '\n')
		.toMatchFileSnapshot('./__snapshots__/features-meta.json');
});
