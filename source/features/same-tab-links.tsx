// ...existing code...
import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import onetime from '../helpers/onetime.js';

function removeTargetBlank(anchor: HTMLAnchorElement): void {
	anchor.removeAttribute('target');
}

function initOnce(): void {
	observe('a[target="_blank"]', removeTargetBlank);
}

void features.add(import.meta.url, {
	init: onetime(initOnce),
});

/*

Test URLs:

images: https://github.com/refined-github/refined-github
new issue button: https://github.com/refined-github/refined-github/issues?q=sort%3Aupdated-desc+is%3Aissue+is%3Aopen

*/
