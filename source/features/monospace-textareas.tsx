import './monospace-textareas.css';
import onetime from 'onetime';

import features from '.';

function init(): void {
	document.body.classList.add('rgh-monospace-textareas');
}

void features.add(__filebasename, {}, {
	awaitDomReady: false,
	init: onetime(init)
});
