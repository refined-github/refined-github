import {test, expect} from 'vitest';

import {
	getFeaturesMeta,
	getImportedFeatures,
} from './readme-parser.js';

test('readme-parser', async () => {
	await expect(getImportedFeatures()).toMatchFileSnapshot('./__snapshots__/imported-features.json');
	await expect(getFeaturesMeta()).toMatchFileSnapshot('./__snapshots__/features-meta.json');
});
