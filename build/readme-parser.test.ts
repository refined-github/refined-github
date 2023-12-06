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
		(_, value) => value ?? null,
		'\t'
	);
	await expect(featuresMetaJson + '\n')
		.toMatchFileSnapshot('./__snapshots__/features-meta.json');
});
