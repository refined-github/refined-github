import {describe, expect, it} from 'vitest';

import normalizeQuickApproveError from './quick-review-errors.js';

describe('normalizeQuickApproveError', () => {
	it('maps pending review API errors to actionable copy', () => {
		const apiError = new Error('Validation Failed\n{"message":"Review comments is pending"}');
		const result = normalizeQuickApproveError(apiError);
		expect(result.message).toBe(
			'You already have a pending review on this pull request.\nSubmit or discard your pending review before using "approve now".',
		);
	});

	it('preserves unrelated errors', () => {
		const apiError = new Error('Validation Failed');
		expect(normalizeQuickApproveError(apiError)).toBe(apiError);
	});
});
