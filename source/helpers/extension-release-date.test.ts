import {assert, test, vi} from 'vitest';

// Must exist before the module under test is imported
vi.hoisted(() => {
	vi.stubGlobal('chrome', {runtime: {getManifest: () => ({version: '0.0.0'})}});
});

const {getExtensionReleaseDate, versionToDate} = await import('./extension-release-date.js');

test('versionToDate', () => {
	assert.equal(versionToDate('26.10.15').getTime(), new Date(2026, 9, 15).getTime());
	assert.equal(versionToDate('25.3.10').getTime(), new Date(2025, 2, 10).getTime());
	// A version without a day is the first of the month
	assert.equal(versionToDate('26.10').getTime(), new Date(2026, 9, 1).getTime());
	assert.equal(versionToDate('26.10.1').getTime(), versionToDate('26.10').getTime());
});

test('getExtensionReleaseDate in development', () => {
	const daysAgo = (Date.now() - getExtensionReleaseDate().getTime()) / (24 * 60 * 60 * 1000);
	assert.closeTo(daysAgo, 7, 0.01);
});
