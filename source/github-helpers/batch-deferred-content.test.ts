import {$, $optional} from 'select-dom';
import {afterEach, describe, expect, test, vi} from 'vitest';

import {loadBatchDeferredContent} from './batch-deferred-content.js';

describe('loadBatchDeferredContent', () => {
	afterEach(() => {
		document.documentElement.removeAttribute('data-render-ssr');
		document.body.replaceChildren();
		vi.unstubAllGlobals();
	});

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
	});

	test('fetches deferred details content on summary mouseenter', async () => {
		const fetchMock = vi.fn()
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					0:
						'<details class="commit-build-statuses" data-deferred-details-content-url="/status-details-hover"><summary>OK</summary><div class="dropdown-menu"><include-fragment></include-fragment></div></details>',
				}),
			})
			.mockResolvedValueOnce({
				ok: true,
				text: async () => '<div class="status-item">Checks passed</div>',
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
		const details = $('details.commit-build-statuses', container);
		expect(details.getAttribute('data-deferred-details-content-url')).toBe('/status-details-hover');
		expect($optional('include-fragment', details)).toBeDefined();

		// Trigger mouseenter on summary
		const summary = $('summary', details);
		summary.dispatchEvent(new MouseEvent('mouseenter'));

		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();

		expect(fetchMock).toHaveBeenCalledTimes(2);
		const [url, options] = fetchMock.mock.calls[1];
		expect(url).toBe('https://github.com/status-details-hover');
		expect(options.headers.accept).toBe('text/html');
		expect(details.hasAttribute('data-deferred-details-content-url')).toBe(false);
		expect($optional('include-fragment', details)).toBeUndefined();
		expect($optional('.status-item', details)).toBeDefined();
	});

	test('fetches deferred details content on details toggle if not preloaded', async () => {
		const fetchMock = vi.fn()
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					0:
						'<details class="commit-build-statuses" data-deferred-details-content-url="/status-details-toggle"><summary>OK</summary><div class="dropdown-menu"><include-fragment></include-fragment></div></details>',
				}),
			})
			.mockResolvedValueOnce({
				ok: true,
				text: async () => '<div class="status-item">Checks passed</div>',
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

		const details = $('details.commit-build-statuses', container);
		details.dispatchEvent(new Event('toggle'));

		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();

		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect($optional('.status-item', details)).toBeDefined();
	});

	test('does nothing on Catalyst stack without data-render-ssr', async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);

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

		expect(fetchMock).not.toHaveBeenCalled();
		expect($optional('batch-deferred-content', container)).toBeDefined();
	});
});
