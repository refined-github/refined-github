import './hide-navigation-hover-highlight.css';

import features from '.';

const className = 'rgh-no-navigation-highlight';

function removeClassName(): void {
	document.body.classList.remove(className);
}

function init(): Deinit {
	document.body.classList.add(className);
	document.body.addEventListener('navigation:keydown', removeClassName, {once: true});

	return () => {
		document.body.removeEventListener('navigation:keydown', removeClassName);
	};
}

void features.add(import.meta.url, {
	awaitDomReady: false,
	init,
});
