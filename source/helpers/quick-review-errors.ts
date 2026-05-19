const pendingReviewErrorRegex = /Review comments (?:is|are) pending/;

export default function normalizeQuickReviewError(error: Error): Error {
	if (pendingReviewErrorRegex.test(error.message)) {
		return new Error(
			'You already have a pending review on this pull request.\nSubmit or discard your pending review before using "approve now".',
		);
	}

	return error;
}
