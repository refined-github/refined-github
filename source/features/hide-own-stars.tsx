import onetime from 'onetime';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {getUsername} from '../github-helpers';

function init(): void {
	observe('#dashboard .news .watch_started, #dashboard .news .fork', {
		constructor: HTMLElement,
		add(item) {
			if ($exists(`a[href^="/${getUsername()}"]`, item)) {
				item.style.display = 'none';
			}
		}
	});
}

void features.add(__filebasename, {
	include: [
		pageDetect.isDashboard
	],
	init: onetime(init)
});
