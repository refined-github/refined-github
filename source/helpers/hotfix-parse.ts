import compareVersions from 'tiny-version-compare';

export type BrokenFeatureEntry = [featureId: FeatureId, relatedIssue: string, unaffectedVersion: string];

export function parseBrokenFeaturesCsv(content: string, currentVersion: string): BrokenFeatureEntry[] {
	const entries: BrokenFeatureEntry[] = [];
	const [, ...rows] = content.trim().split('\n');
	for (const row of rows) {
		if (!row.trim()) {
			continue;
		}

		const [featureId, relatedIssue, unaffectedVersion] = row.split(',').map(cell => cell.trim());
		if (featureId && relatedIssue && (!unaffectedVersion || compareVersions(unaffectedVersion, currentVersion) > 0)) {
			entries.push([featureId as FeatureId, relatedIssue, unaffectedVersion]);
		}
	}

	return entries;
}
