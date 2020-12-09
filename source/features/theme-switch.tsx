import './theme-switch.css';
import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import features from '.';
import fetchDom from '../helpers/fetch-dom';

async function init(): Promise<void> {
	const form = (await fetchDom('https://github.com/settings/appearance', '.js-color-mode-settings'))!;
	form.classList.add('rgh-theme-switch-form', 'mt-1', 'ml-1');
	select('.flex-column', form)!.classList.remove('flex-lg-row');
	for (const image of select.all('img', form)) {
		image.remove();
	}
	for (const radio of select.all('.position-relative', form)) {
		radio.classList.remove('mb-4');
	}

	observe('.dropdown-item[href="https://gist.github.com/mine"]:not(.rgh-theme-switch)', {
		add(item) {
			item.classList.add('rgh-theme-switch');
			item.after(
				<>
					<span role="menuitem" className="dropdown-item rgh-theme-switch-title">Theme preference</span>
					{form}
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
