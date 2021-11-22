import './hide-navigation-hover-highlight.css';
import onetime from 'onetime';

import features from '.';

const className = 'rgh-no-navigation-highlight';

function init(): void {
	document.body.classList.add(className);
	document.body.addEventListener('navigation:keydown', () => {
		document.body.classList.remove(className);
	}, {once: true});
}

void features.add(import.meta.url, {
	awaitDomReady: false,
	init: onetime(init),
});
