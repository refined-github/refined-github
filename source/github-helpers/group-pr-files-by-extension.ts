export type PullRequestFileRow = {
	filename: string;
	additions: number;
	deletions: number;
	status?: string;
};

export type ExtensionDiffRow = {
	label: string;
	additions: number;
	deletions: number;
};

export type GroupPullRequestFilesResult = {
	rows: ExtensionDiffRow[];
	zeroLineFileCount: number;
};

/** Group label for PR file path: "No extension", ".gitignore"-style dotfile basename, or ".ts" from last segment. */
export function getExtensionGroupLabelFromPath(filename: string): string {
	const basename = filename.split('/').pop() ?? filename;
	if (!basename.includes('.')) {
		return 'No extension';
	}

	// Dotfiles like `.gitignore`, `.env` (single segment after leading dot)
	if (basename.startsWith('.') && !basename.slice(1).includes('.')) {
		return basename.toLowerCase();
	}

	const lastDot = basename.lastIndexOf('.');
	return basename.slice(lastDot).toLowerCase();
}

/** Aggregate additions/deletions by extension group; skips files with no line-level diff. */
export function groupPullRequestFilesByExtension(files: PullRequestFileRow[]): GroupPullRequestFilesResult {
	const statsByLabel = new Map<string, {additions: number; deletions: number}>();
	let zeroLineFileCount = 0;

	for (const file of files) {
		if (file.additions + file.deletions === 0) {
			zeroLineFileCount++;
			continue;
		}

		const label = getExtensionGroupLabelFromPath(file.filename);
		const existing = statsByLabel.get(label);
		if (existing) {
			existing.additions += file.additions;
			existing.deletions += file.deletions;
		} else {
			statsByLabel.set(label, {additions: file.additions, deletions: file.deletions});
		}
	}

	const rows: ExtensionDiffRow[] = [...statsByLabel.entries()]
		.map(([label, {additions, deletions}]) => ({label, additions, deletions}))
		.toSorted((a, b) => {
			const totalDelta = (b.additions + b.deletions) - (a.additions + a.deletions);
			if (totalDelta !== 0) {
				return totalDelta;
			}

			return a.label.localeCompare(b.label);
		});

	return {rows, zeroLineFileCount};
}
