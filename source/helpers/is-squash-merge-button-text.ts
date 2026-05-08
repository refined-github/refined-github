const squashMergeButtonLabels = new Set([
	'Confirm squash and merge',
	'Confirm auto-merge (squash)',
	'Confirm bypass rules and merge (squash)',
]);

export default function isSquashMergeButtonText(text: string | undefined): boolean {
	if (!text) {
		return false;
	}

	return squashMergeButtonLabels.has(text.trim());
}
