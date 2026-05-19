import {describe, expect, it} from 'vitest';

import normalizeQuickReviewError from './quick-review-errors.js';

describe('normalizeQuickReviewError', () => {
	it('maps direct pending review API errors to actionable copy', () => {
		const apiError = new Error('Review comments are pending');
		const result = normalizeQuickReviewError(apiError);
		expect(result.message).toBe(
			'You already have a pending review on this pull request.\nSubmit or discard your pending review before using "approve now".',
		);
	});

	it('maps pending review API errors to actionable copy', () => {
		const apiError = new Error('Validation Failed\n{"message":"Review comments is pending"}');
		const result = normalizeQuickReviewError(apiError);
		expect(result.message).toBe(
			'You already have a pending review on this pull request.\nSubmit or discard your pending review before using "approve now".',
		);
	});

	it('preserves unrelated errors', () => {
		const apiError = new Error('Validation Failed');
		expect(normalizeQuickReviewError(apiError)).toBe(apiError);
	});
});
