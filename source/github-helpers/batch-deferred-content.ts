import {$$} from 'select-dom';
import type {Action} from 'svelte/action';

export async function loadBatchDeferredContent(element: HTMLElement): Promise<void> {
	if (!document.documentElement.hasAttribute('data-render-ssr')) {
		// SSR is not used, no need to polyfill
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

	const template = document.createElement('template');
	template.innerHTML = html.trim();
	element.replaceWith(template.content);
}

const loadBatchDeferredContentAction: Action = (element) => {
	void loadBatchDeferredContent(element);
};

export default loadBatchDeferredContentAction;
