import {$optional} from 'select-dom';
import {describe, expect, test, vi} from 'vitest';

import {loadBatchDeferredContent} from './batch-deferred-content.js';

describe('loadBatchDeferredContent', () => {
	test('replaces element with fetched HTML on ui-service', async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({0: '<details class="commit-build-statuses"><summary>OK</summary></details>'}),
		});
		vi.stubGlobal('fetch', fetchMock);

		document.documentElement.setAttribute('data-render-ssr', 'true');
		const container = document.createElement('div');
		const element = document.createElement('batch-deferred-content');
		element.setAttribute('data-url', '/user/repo/commits/checks-statuses-rollups');
		const input = document.createElement('input');
		input.name = 'oid';
		input.value = '123456';
		element.append(input);
		container.append(element);
		document.body.append(container);

		await loadBatchDeferredContent(element);

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [url, options] = fetchMock.mock.calls[0];
		expect(url).toBe('/user/repo/commits/checks-statuses-rollups');
		expect(options.method).toBe('POST');
		expect($optional('details.commit-build-statuses', container)).toBeDefined();
		expect($optional('batch-deferred-content', container)).toBeUndefined();

		document.documentElement.removeAttribute('data-render-ssr');
		container.remove();
		vi.unstubAllGlobals();
	});

	test('does nothing on Catalyst stack without data-render-ssr', async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);

		const container = document.createElement('div');
		const element = document.createElement('batch-deferred-content');
		element.setAttribute('data-url', '/user/repo/commits/checks-statuses-rollups');
		container.append(element);
		document.body.append(container);

		await loadBatchDeferredContent(element);

		expect(fetchMock).not.toHaveBeenCalled();
		expect($optional('batch-deferred-content', container)).toBeDefined();

		container.remove();
		vi.unstubAllGlobals();
	});
});
