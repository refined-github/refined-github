export default function cleanCommitMessage(message: string, closingKeywords = false, prAuthor?: string): string {
	const preservedContent = new Set();

	// This method ensures that "Co-authored-by" capitalization doesn't affect deduplication.
	// Also, drop co-authors whose username (extracted from their GitHub privacy email) matches the PR author.
	for (const [, author] of message.matchAll(/co-authored-by: ([^\n]+)/gi)) {
		const privacyEmailUsername = (/<(?:\d+\+)?([^@>]+)@users\.noreply\.github\.com>/i.exec(author))?.[1];
		if (prAuthor && privacyEmailUsername === prAuthor) {
			continue;
		}

		preservedContent.add('Co-authored-by: ' + author);
	}

	// Preserve "Signed-off-by" lines (DCO signoffs)
	// https://github.com/refined-github/refined-github/issues/9330#issuecomment-4361024401
	for (const [, signer] of message.matchAll(/signed-off-by: ([^\n]+)/gi)) {
		preservedContent.add('Signed-off-by: ' + signer);
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
