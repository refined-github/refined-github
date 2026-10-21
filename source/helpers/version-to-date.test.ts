import {assert, test} from 'vitest';

import versionToDate from './version-to-date.js';

test('versionToDate', () => {
	assert.equal(versionToDate('26.10.15').getTime(), new Date(2026, 9, 15).getTime());
	assert.equal(versionToDate('25.3.10').getTime(), new Date(2025, 2, 10).getTime());
	// A version without a day is the first of the month
	assert.equal(versionToDate('26.10').getTime(), new Date(2026, 9, 1).getTime());
	assert.equal(versionToDate('26.10.1').getTime(), versionToDate('26.10').getTime());
});
