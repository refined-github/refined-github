import './theme-switch.css';
import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';
import fetchDom from '../helpers/fetch-dom';

async function init(): Promise<void> {
	const dom = (await fetchDom('https://github.com/settings/appearance', '.js-color-mode-settings'))!;
	dom.classList.add('rgh-theme-switch', 'mt-1', 'ml-1');
	select('.flex-column', dom)!.classList.remove('flex-lg-row');
	for (const radio of select.all('.position-relative', dom)) {
		radio.classList.remove('mb-4');
	}

	observe('.dropdown-item[href="https://gist.github.com/mine"]', {
		add(item) {
			item.after(
				<>
					<span role="menuitem" className="dropdown-item rgh-theme-switch-title">Theme preference</span>
					{dom}
				</>
			);
		}
	});
}

void features.add(__filebasename, {
	exclude: [
		pageDetect.isGist
	],
	init: onetime(init)
});
