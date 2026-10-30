import domify from 'doma';
import {$$, $optional} from 'select-dom';
import type {Action} from 'svelte/action';

import fetchDom from '../helpers/fetch-dom.js';

// Replicate `<include-fragment>` behavior to bypass nonce check
async function loadDeferredDetailsContent(details: HTMLDetailsElement): Promise<void> {
	const url = details.getAttribute('data-deferred-details-content-url');
	if (!url) {
		return;
	}

	details.removeAttribute('data-deferred-details-content-url');

	const fragment = $optional([
		'include-fragment',
		'poll-include-fragment',
	], details);
	if (!fragment) {
		return;
	}

	const dom = await fetchDom(url);
	if (!details.isConnected) {
		return;
	}

	fragment.replaceWith(dom);
}

function setupDeferredDetailsContent(details: HTMLDetailsElement): void {
	if (!details.hasAttribute('data-deferred-details-content-url')) {
		return;
	}

	const load = (): void => {
		void loadDeferredDetailsContent(details);
	};

	details.addEventListener('toggle', load, {once: true});

	const summary = $optional('summary', details);
	summary?.addEventListener('mouseenter', load, {once: true});
}

// When "Command Palette" Feature Preview is disabled, SSR is used
// and `<batch-deferred-content>` is not defined, so polyfill it
export async function loadBatchDeferredContent(element: HTMLElement): Promise<void> {
	if (!document.documentElement.hasAttribute('data-render-ssr')) {
		return;
	}

	const url = element.getAttribute('data-url');
	if (!url) {
		return;
	}

	const formData = new FormData();
	formData.set('_method', 'GET');
	for (const input of $$<HTMLInputElement>('input', element)) {
		formData.append(`items[0][${input.name}]`, input.value);
	}

	const response = await fetch(url, {
		method: 'POST',
		body: formData,
		headers: {
			accept: 'application/json',
			'X-Requested-With': 'XMLHttpRequest',
		},
	});

	if (!response.ok || !element.isConnected) {
		return;
	}

	const json = await response.json() as Record<string, string>;
	const html = json['0'];
	if (!html || !element.isConnected) {
		return;
	}

	const dom = domify(html);
	const details = $optional('details', dom);
	element.replaceWith(dom);

	if (details) {
		setupDeferredDetailsContent(details);
	}
}

const loadBatchDeferredContentAction: Action = (element) => {
	void loadBatchDeferredContent(element);
};

export default loadBatchDeferredContentAction;
