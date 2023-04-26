export default function cleanCommitMessage(message: string, closingKeywords = false): string {
	const preservedContent = new Set();

	// This method ensures that "Co-authored-by" capitalization doesn't affect deduplication
	for (const [, author] of message.matchAll(/co-authored-by: ([^\n]+)/gi)) {
		preservedContent.add('Co-authored-by: ' + author);
	}

	if (!closingKeywords) {
		return [...preservedContent].join('\n');
	}

	// Preserve closing issues numbers when a PR is merged into a non-default branch since GitHub doesn't close them #4531
	// https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/using-keywords-in-issues-and-pull-requests#linking-a-pull-request-to-an-issue
	for (const [line] of message.matchAll(/(fix(es|ed)?|close[sd]?|resolve[sd]?)([^\n]+)/gi)) {
		// Ensure it includes a reference or URL
		if (/#\d+/.test(line) || line.includes('http')) {
			preservedContent.add(line);
		}
	}

	return [...preservedContent].join('\n');
}
