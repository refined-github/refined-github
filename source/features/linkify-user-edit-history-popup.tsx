/** @jsx h */
import {h} from 'preact';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import * as pageDetect from 'github-url-detection';

import render from '../helpers/render';

import {wrap} from '../helpers/dom-utils';
import features from '.';

function init(): void {
	observe('details-dialog .Box-header .mr-3 > img:not([alt*="[bot]"])', {
		constructor: HTMLImageElement,
		add(avatar) {
			const userName = avatar.alt.slice(1);
			// Linkify name first
			wrap(avatar.nextElementSibling!, <a className="link-gray-dark Link--primary" href={`/${userName}`}/>);

			// Then linkify avatar
			wrap(avatar, <a href={`/${userName}`}/>);
		}
	});
}

void features.add(__filebasename, {
	include: [
		pageDetect.isConversation
	],
	init: onetime(init)
});
