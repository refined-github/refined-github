import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {wrap, isEditable} from '../helpers/dom-utils';

function linkifyLocation(location: ChildNode, className: string): void {
	const locationName = location.textContent!.trim();
	const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationName)}`;

	location.before(' '); // Keeps the link’s underline from extending out to the icon
	wrap(location, <a className={className} href={googleMapsLink}/>);
}

function addLocation(baseElement: HTMLElement): void {
	for (const {nextElementSibling, nextSibling} of select.all('.octicon-location', baseElement)) {
		const location = nextElementSibling ?? nextSibling!; // `nextSibling` alone might point to an empty TextNode before an element, if there’s an element
		if (isEditable(location)) {
			continue;
		}

		linkifyLocation(location, baseElement === document.body ? 'Link--primary' : 'Link--primary no-underline');
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

function searchInit(): void {
	for (const possibleLocation of select.all('#user_search_results .text-small .mr-3:first-child')) {
		// It could be a email which has a link
		if (!possibleLocation.firstElementChild) {
			linkifyLocation(possibleLocation, 'Link--muted');
		}
	}
}

void features.add(import.meta.url, {
	init,
}, {
	include: [
		() => pageDetect.isGlobalSearchResults() && new URLSearchParams(location.search).get('type') === 'users',
	],
	init: searchInit,
});
