import React from 'dom-chef';
import select from 'select-dom';

import features from '.';
import {wrap, isEditable} from '../helpers/dom-utils';

function addLocation(baseElement: HTMLElement): void {
	for (const {nextElementSibling, nextSibling} of select.all('.octicon-location', baseElement)) {
		const location = nextElementSibling ?? nextSibling!; // `nextSibling` alone might point to an empty TextNode before an element, if there’s an element
		if (isEditable(location)) {
			continue;
		}

		const locationName = location.textContent!.trim();
		const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${locationName}`;

		location.before(' '); // Keeps the link’s underline from extending out to the icon
		const link = <a className="Link--primary" href={googleMapsLink}/>;

		// The location is in a hovercard
		if (baseElement !== document.body) {
			link.classList.add('no-underline');
		}

		wrap(location, link);
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
	init,
});
