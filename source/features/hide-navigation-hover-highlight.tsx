import './hide-navigation-hover-highlight.css';

import features from '.';

const className = 'rgh-no-navigation-highlight';

function init(signal: AbortSignal): void {
	document.body.classList.add(className);
	document.body.addEventListener('navigation:keydown', () => {
		document.body.classList.remove(className);
	}, {once: true, signal});
}

void features.add(import.meta.url, {
	awaitDomReady: false,
	init,
});
