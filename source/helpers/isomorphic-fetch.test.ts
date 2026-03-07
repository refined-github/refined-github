import {
	afterEach,
	expect,
	test,
	vi,
} from 'vitest';

const {isWebPage, messageRuntime} = vi.hoisted(() => ({
	isWebPage: vi.fn(() => true),
	messageRuntime: vi.fn(),
}));

vi.mock('webext-detect', () => ({isWebPage}));
vi.mock('webext-msg', () => ({messageRuntime}));

const {isomorphicFetchText} = await import('./isomorphic-fetch.js');

afterEach(() => {
	messageRuntime.mockReset();
});

test('isomorphicFetchText fetches via the background page on webpages', async () => {
	const options = {cache: 'no-store'} satisfies RequestInit;
	messageRuntime.mockResolvedValue('body');

	await expect(isomorphicFetchText('https://example.com/hotfix.css', options)).resolves.toBe('body');
	expect(messageRuntime).toHaveBeenCalledWith({
		fetchText: {
			url: 'https://example.com/hotfix.css',
			options,
		},
	});
});
