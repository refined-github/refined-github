import {describe, expect, it, vi} from 'vitest';

describe('api.getError', () => {
	it('detects pending pull request reviews', async () => {
		vi.resetModules();
		vi.doMock('../options-storage.js', () => ({
			getToken: vi.fn().mockResolvedValue('token'),
		}));
		const {default: api} = await import('./api.js');
		const error = await api.getError({
			message: 'Validation Failed',
			errors: [
				{
					message: 'Review comments is pending',
				},
			],
		});

		expect(error.message).toBe(
			'You already have a pending review on this pull request.\nSubmit or discard your pending review before using "approve now".',
		);
	});

	it('surfaces validation details', async () => {
		vi.resetModules();
		vi.doMock('../options-storage.js', () => ({
			getToken: vi.fn().mockResolvedValue('token'),
		}));
		const {default: api} = await import('./api.js');
		const response = {
			message: 'Validation Failed',
			errors: [
				{
					message: 'A pull request review already exists',
				},
			],
		};
		const error = await api.getError(response);

		expect(error.message).toBe('A pull request review already exists');
		expect(error.response).toEqual(response);
	});
});
