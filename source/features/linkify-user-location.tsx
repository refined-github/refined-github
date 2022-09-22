import React from 'dom-chef';

import features from '../feature-manager';
import attachElement from '../helpers/attach-element';
import {wrap} from '../helpers/dom-utils';
import observe from '../helpers/selector-observer';

function linkify(location: Element): HTMLAnchorElement {
	const locationName = location.textContent!.trim();
	const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationName)}`;

	location.before(' '); // Keeps the link’s underline from extending out to the icon
	const link = <a className="Link--primary" href={googleMapsLink}/>;

	if (location.parentElement!.closest('.Popover')) {
	// Match the style of other links in the hovercard
		link.classList.add('text-underline');
	}

	wrap(location, link);

	return link as unknown as HTMLAnchorElement;
}

function addLocation({nextElementSibling, nextSibling}: SVGElement): void {
	attachElement({
		// `nextSibling` alone might point to an empty TextNode before an element, if there’s an element
		anchor: nextElementSibling ?? nextSibling as Element,
		forEach: linkify});
}

function init(signal: AbortSignal): void {
	// `itemprop` is used on profiles
	// `aria-label` in the hovercard
	observe(`
		:is(
			[itemprop="homeLocation"],
			[aria-label="user location"]
		) svg.octicon-location
	`, addLocation, {signal});
}

void features.add(import.meta.url, {
	awaitDomReady: false,
	init,
});
