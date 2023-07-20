import './hide-navigation-hover-highlight.css';
import onetime from 'onetime';

import features from '../feature-manager.js';

const className = 'rgh-no-navigation-highlight';

function init(): void {
	document.documentElement.classList.add(className);
	document.documentElement.addEventListener('navigation:keydown', () => {
		document.documentElement.classList.remove(className);
	}, {once: true});
}

void features.add(import.meta.url, {
	init: onetime(init),
});

/*

Test URLs

- Notifications list: https://github.com/notifications
- Issue list: https://github.com/refined-github/refined-github/issues
- React file list: https://github.com/refined-github/refined-github/tree/main/.github
- File list: File list

*/
