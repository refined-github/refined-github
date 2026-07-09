import {describe, expect, it} from 'vitest';

import {parseBrokenFeaturesCsv} from './hotfix-parse.js';

const header = 'Feature name, Issue, Minimum working version';

describe('parseBrokenFeaturesCsv', () => {
	it('keeps features whose fix version is still ahead of currentVersion', () => {
		const csv = [header, 'some-feature,123,26.6.7'].join('\n');
		expect(parseBrokenFeaturesCsv(csv, '26.6.0')).toEqual([['some-feature', '123', '26.6.7']]);
	});

	it('drops features whose fix version has already shipped', () => {
		const csv = [header, 'some-feature,123,26.2.4'].join('\n');
		expect(parseBrokenFeaturesCsv(csv, '26.6.0')).toEqual([]);
	});

	it('drops features whose fix version equals currentVersion', () => {
		const csv = [header, 'some-feature,123,26.6.0'].join('\n');
		expect(parseBrokenFeaturesCsv(csv, '26.6.0')).toEqual([]);
	});

	it('keeps features with no fix version (permanently broken until CSV is edited)', () => {
		const csv = [header, 'some-feature,123,'].join('\n');
		expect(parseBrokenFeaturesCsv(csv, '26.6.0')).toEqual([['some-feature', '123', '']]);
	});

	it('always discards the first row as a header', () => {
		const csv = ['not-a-real-feature,000,', 'some-feature,123,'].join('\n');
		expect(parseBrokenFeaturesCsv(csv, '26.6.0')).toEqual([['some-feature', '123', '']]);
	});

	it('skips blank lines', () => {
		const csv = [header, 'some-feature,123,', '', ' '.repeat(3), 'other-feature,456,'].join('\n');
		expect(parseBrokenFeaturesCsv(csv, '26.6.0')).toEqual([
			['some-feature', '123', ''],
			['other-feature', '456', ''],
		]);
	});

	it('skips rows missing a featureId or relatedIssue', () => {
		const csv = [header, ',777,', 'no-issue,,', 'valid-feature,888,'].join('\n');
		expect(parseBrokenFeaturesCsv(csv, '26.6.0')).toEqual([['valid-feature', '888', '']]);
	});

	it('trims whitespace around cells', () => {
		const csv = [header, ' some-feature , 123 , '].join('\n');
		expect(parseBrokenFeaturesCsv(csv, '26.6.0')).toEqual([['some-feature', '123', '']]);
	});

	it('does not deduplicate repeated feature ids', () => {
		const csv = [header, 'dupe-feature,555,', 'dupe-feature,556,26.6.7'].join('\n');
		expect(parseBrokenFeaturesCsv(csv, '26.6.0')).toEqual([
			['dupe-feature', '555', ''],
			['dupe-feature', '556', '26.6.7'],
		]);
	});

	it('returns [] for empty content', () => {
		expect(parseBrokenFeaturesCsv('', '26.6.0')).toEqual([]);
	});

	it('returns [] for header-only content', () => {
		expect(parseBrokenFeaturesCsv(header, '26.6.0')).toEqual([]);
	});
});
