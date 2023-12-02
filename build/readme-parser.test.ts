import {test, expect} from 'vitest';

import {
	getFeaturesMeta,
	getImportedFeatures,
} from './readme-parser.js';

test('readme-parser', async () => {
	await expect(getImportedFeatures().join('\n') + '\n')
		.toMatchFileSnapshot('./__snapshots__/imported-features.txt');
	await expect(JSON.parse(JSON.stringify(getFeaturesMeta())))
		.toMatchFileSnapshot('./__snapshots__/features-meta.json');
});
