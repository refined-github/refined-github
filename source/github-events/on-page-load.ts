import * as pageDetect from 'github-url-detection';

const handlers = new EventTarget();

const observer = new MutationObserver(records => {
	for (const record of records) {
		for (const node of record.removedNodes) {
			if (node instanceof HTMLElement && node.classList.contains('turbo-progress-bar')) {
				if (pageDetect.isRepoTree() || pageDetect.isSingleFile()) {
					// Only these pages don't have a "turbo:render" event
					// https://github.com/refined-github/refined-github/issues/6554
					handlers.dispatchEvent(new Event('page-load'));
				}

				return;
			}
		}
	}
});

export default function onAjaxPageLoad(callback: VoidFunction, signal?: AbortSignal): void {
	observer.observe(document.documentElement, {childList: true});
	handlers.addEventListener('page-load', callback, {signal});
	document.addEventListener('turbo:render', callback, {signal});
}
