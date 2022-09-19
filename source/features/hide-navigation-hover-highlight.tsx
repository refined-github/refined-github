import './hide-navigation-hover-highlight.css';
import onetime from 'onetime';

import features from '.';

const className = 'rgh-no-navigation-highlight';

function init(): void {
	document.documentElement.classList.add(className);
	document.documentElement.addEventListener('navigation:keydown', () => {
		document.documentElement.classList.remove(className);
	}, {once: true});
}

void features.add(import.meta.url, {
	awaitDomReady: false,
	deduplicate: 'has-rgh',
	init: onetime(init),
});
