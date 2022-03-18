import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';

import features from '.';
import {wrap, isEditable} from '../helpers/dom-utils';

function addLocation(baseElement: HTMLElement): void {
	for (const {nextElementSibling, nextSibling} of select.all('.octicon-location', baseElement)) {
		const location = nextElementSibling ?? nextSibling!; // `nextSibling` alone might point to an empty TextNode before an element, if there’s an element
		if (isEditable(location)) {
			continue;
		}

		const locationName = location.textContent!.trim();
		const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationName)}`;

		location.before(' '); // Keeps the link’s underline from extending out to the icon
		wrap(location, <a href={googleMapsLink}/>);
	}
}

const hovercardObserver = new MutationObserver(([mutation]) => {
	addLocation(mutation.target as HTMLElement);
});

function init(): void {
	addLocation(document.body);

	const hovercardContainer = select('.js-hovercard-content > .Popover-message');
	if (hovercardContainer) {
		hovercardObserver.observe(hovercardContainer, {childList: true});
	}
}

void features.add(import.meta.url, {
	init: onetime(init),
});
