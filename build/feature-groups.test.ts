import {assert, describe, test} from 'vitest';

import {isFeaturePrivate} from '../source/helpers/feature-utils.js';
import featureGroups from './feature-groups.json' with {type: 'json'};
import {getFeaturesMeta} from './features-parser.js';

// Re-run tests when these files change https://github.com/vitest-dev/vitest/discussions/5864
void import.meta.glob('../source/features/*.*');

const featuresMeta = getFeaturesMeta();
const fireRegex = /^🔥 /;
const groupedIds = Object.values(featureGroups).flat().map(entry => entry.replace(fireRegex, ''));

const hiddenFromGroups = new Set<string>(['extensible-nav']);

describe('feature-groups.json', () => {
	test('Highlights come first', () => {
		assert.equal(Object.keys(featureGroups)[0], 'Highlights');
	});

	test('Highlights have a screenshot and are not marked with 🔥', () => {
		for (const entry of featureGroups.Highlights) {
			assert(!entry.startsWith('🔥 '), `${entry} is already in Highlights, remove the 🔥`);
			const meta = featuresMeta.find(({id}) => id === entry);
			assert(meta?.screenshot, `${entry} should have a screenshot to be in Highlights`);
		}
	});

	test('every documented feature is in exactly one group', () => {
		for (const {id} of featuresMeta) {
			if (hiddenFromGroups.has(id) || isFeaturePrivate(id)) {
				continue;
			}

			assert.equal(
				groupedIds.filter(groupedId => groupedId === id).length,
				1,
				`${id} should be in exactly one group of feature-groups.json`,
			);
		}
	});

	test('groups only list existing features', () => {
		const ids = new Set(featuresMeta.map(({id}) => id));
		for (const id of groupedIds) {
			assert(ids.has(id as FeatureId), `${id} is in feature-groups.json but has no description in its file header`);
		}
	});
});
