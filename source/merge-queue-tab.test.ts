import {beforeEach, expect, it, vi} from 'vitest';

const mocks = vi.hoisted(() => ({
	addTab: vi.fn(),
	removeTab: vi.fn(),
	cache: new Map<string, boolean>(),
	getDefaultBranch: vi.fn(),
	init: undefined as undefined | ((signal?: AbortSignal) => Promise<false | void>),
}));

vi.mock('./components/extensible-nav-store.js', () => ({addTab: mocks.addTab, removeTab: mocks.removeTab}));
vi.mock('./feature-manager.js', () => ({
	default: {
		add(_url: string, {init}: {init: (signal: AbortSignal) => Promise<false | void>}) {
			mocks.init = async (signal = new AbortController().signal) => init(signal);
		},
	},
}));
vi.mock('./github-helpers/get-default-branch.js', () => ({default: mocks.getDefaultBranch}));
vi.mock('./github-helpers/index.js', () => ({
	buildRepoUrl: (...parts: string[]) => `https://github.com/example/repo/${parts.join('/')}`,
}));
vi.mock('octicons-plain-react/GitMergeQueue', () => ({default: () => undefined}));
vi.mock('webext-storage-cache', () => ({
	// eslint-disable-next-line @typescript-eslint/naming-convention -- Mocking the package export
	CachedFunction: class {
		readonly updater: (url: string) => Promise<boolean>;
		constructor(_name: string, {updater}: {updater: (url: string) => Promise<boolean>}) {
			this.updater = updater;
		}

		async get(url: string): Promise<boolean> {
			if (mocks.cache.has(url)) {
				return mocks.cache.get(url)!;
			}

			const result = await this.updater(url);
			mocks.cache.set(url, result);
			return result;
		}
	},
}));

beforeEach(async () => {
	vi.resetModules();
	vi.clearAllMocks();
	mocks.cache.clear();
	mocks.getDefaultBranch.mockResolvedValue('main');
	await import('./features/merge-queue-tab.js');
});

it('retries after a failed probe and inserts the tab only once', async () => {
	const fetch = vi.spyOn(globalThis, 'fetch')
		.mockRejectedValueOnce(new Error('offline'))
		.mockResolvedValue({status: 200, redirected: false} as Response);

	await expect(mocks.init!()).rejects.toThrow('offline');
	expect(mocks.addTab).not.toHaveBeenCalled();
	await mocks.init!();
	await mocks.init!();
	expect(fetch).toHaveBeenCalledWith('https://github.com/example/repo/queue/main', {method: 'HEAD'});
	expect(fetch).toHaveBeenCalledTimes(2);
	expect(mocks.addTab).toHaveBeenCalledOnce();
	expect(mocks.addTab.mock.calls[0][0]).toMatchObject({
		label: 'Merge queue',
		href: 'https://github.com/example/repo/queue/main',
	});
	fetch.mockRestore();
});

it('omits the tab on a missing queue and encodes special branch characters', async () => {
	mocks.getDefaultBranch.mockResolvedValue('release/v1#%');
	const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue({status: 404, redirected: false} as Response);
	await expect(mocks.init!()).resolves.toBe(false);
	expect(fetch).toHaveBeenCalledWith('https://github.com/example/repo/queue/release/v1%23%25', {method: 'HEAD'});
	expect(mocks.addTab).not.toHaveBeenCalled();
	fetch.mockRestore();
});

it('does not cache a temporary HTTP failure as an absent queue', async () => {
	const fetch = vi.spyOn(globalThis, 'fetch')
		.mockResolvedValueOnce({status: 503, redirected: false} as Response)
		.mockResolvedValue({status: 200, redirected: false} as Response);

	await expect(mocks.init!()).rejects.toThrow('HTTP 503');
	await mocks.init!();
	expect(fetch).toHaveBeenCalledTimes(2);
	expect(mocks.addTab).toHaveBeenCalledOnce();
	fetch.mockRestore();
});

it('removes a disabled queue and updates the link if the default branch changes', async () => {
	const fetch = vi.spyOn(globalThis, 'fetch')
		.mockResolvedValueOnce({status: 200, redirected: false} as Response)
		.mockResolvedValueOnce({status: 404, redirected: false} as Response)
		.mockResolvedValue({status: 200, redirected: false} as Response);

	await mocks.init!();
	mocks.cache.clear(); // The cached result expired after the queue was disabled.
	await expect(mocks.init!()).resolves.toBe(false);
	expect(mocks.removeTab).toHaveBeenCalledExactlyOnceWith('rgh-merge-queue');

	mocks.getDefaultBranch.mockResolvedValue('release/v2');
	await mocks.init!();
	expect(mocks.addTab.mock.calls.at(-1)?.[0]).toMatchObject({
		href: 'https://github.com/example/repo/queue/release/v2',
	});
	expect(mocks.addTab).toHaveBeenCalledTimes(2);
	expect(fetch).toHaveBeenCalledTimes(3);
	fetch.mockRestore();
});

it('replaces the queue link when the default branch changes without a missing interval', async () => {
	const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue({status: 200, redirected: false} as Response);
	await mocks.init!();
	mocks.getDefaultBranch.mockResolvedValue('stable');
	await mocks.init!();
	expect(mocks.addTab.mock.calls.at(-1)?.[0]).toMatchObject({
		href: 'https://github.com/example/repo/queue/stable',
	});
	expect(mocks.addTab).toHaveBeenCalledTimes(2);
	expect(mocks.removeTab).not.toHaveBeenCalled();
	fetch.mockRestore();
});

it.each([200, 404])('ignores an older HTTP %i result after a newer branch was selected', async status => {
	const older = Promise.withResolvers<Response>();
	const fetch = vi.spyOn(globalThis, 'fetch')
		.mockImplementationOnce(async () => older.promise)
		.mockResolvedValue({status: 200, redirected: false} as Response);

	const first = mocks.init!();
	await vi.waitFor(() => {
		expect(fetch).toHaveBeenCalledTimes(1);
	});
	mocks.getDefaultBranch.mockResolvedValue('stable');
	await mocks.init!();
	older.resolve({status, redirected: false} as Response);
	await first;
	expect(mocks.addTab).toHaveBeenCalledOnce();
	expect(mocks.addTab.mock.calls[0][0]).toMatchObject({
		href: 'https://github.com/example/repo/queue/stable',
	});
	expect(mocks.removeTab).not.toHaveBeenCalled();
	fetch.mockRestore();
});
