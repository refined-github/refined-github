import React from 'dom-chef';

import features from '../feature-manager';
import attachElement from '../helpers/attach-element';
import {wrap} from '../helpers/dom-utils';
import observe from '../helpers/selector-observer';

function linkify(location: Element): Element {
	const locationName = location.textContent!.trim();
	const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationName)}`;

	location.before(' '); // Keeps the link’s underline from extending out to the icon
	const link = <a className="Link--primary" href={googleMapsLink}/>;

	if (location.parentElement!.closest('.Popover')) {
	// Match the style of other links in the hovercard
		link.classList.add('text-underline');
	}

	wrap(location, link);

	return link;
}

function addLocation({nextElementSibling, nextSibling}: SVGElement): void {
	attachElement(
		// `nextSibling` alone might point to an empty TextNode before an element, if there’s an element
		nextElementSibling ?? nextSibling as Element,
		{forEach: linkify},
	);
}

// No `include`, no `signal` necessary
function init(): void {
	observe([
		'[itemprop="homeLocation"] svg.octicon-location', // `isUserProfile`
		'[aria-label="user location"] svg.octicon-location', // Hover cards
	], addLocation);
}

void features.add(import.meta.url, {
	awaitDomReady: false,
	init,
});
