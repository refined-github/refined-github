import {assert, beforeEach, test, vi} from 'vitest';

import {getCloseDate} from './netiquette.js';

const {isOpenConversation, apiV3} = vi.hoisted(() => ({
	isOpenConversation: vi.fn(),
	apiV3: vi.fn(),
}));

vi.mock('github-url-detection', () => ({
	isOpenConversation,
}));
vi.mock('./api.js', () => ({
	default: {
		v3: apiV3,
	},
}));
vi.mock('./index.js', () => ({
	getConversationNumber: () => 123,
}));

beforeEach(() => {
	isOpenConversation.mockReturnValue(false);
});

test('returns the close date', async () => {
	apiV3.mockResolvedValue(Object.fromEntries([
		['closed_at', '2026-01-02T03:04:05Z'],
	]));

	assert.deepEqual(await getCloseDate(), new Date('2026-01-02T03:04:05Z'));
});

test('ignores a null close date', async () => {
	apiV3.mockResolvedValue(Object.fromEntries([
		['closed_at', null],
	]));

	assert.isUndefined(await getCloseDate());
});
