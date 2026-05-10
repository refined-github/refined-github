import {expect, test} from 'vitest';

import {getNewFeatureName, getOldFeatureNames} from './feature-data.js';

test('resolves dropped feature names to the latest feature id', () => {
	expect(getNewFeatureName('latest-tag-button')).toBe('releases-dropdown');
});

test('includes dropped feature names in old feature aliases', () => {
	expect(getOldFeatureNames('releases-dropdown')).toContain('latest-tag-button');
});
