// ...existing code...
import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function removeTargetBlank(anchor: HTMLAnchorElement): void {
	anchor.removeAttribute('target');
}

function initOnce(): void {
	observe('a[target="_blank"]', removeTargetBlank);
}

void features.add(import.meta.url, {
	init: initOnce,
});
