import React from 'dom-chef';

import onetime from '../helpers/onetime.js';
import features from '../feature-manager.js';
import {wrap} from '../helpers/dom-utils.js';
import observe from '../helpers/selector-observer.js';

function addLocation({nextElementSibling, nextSibling}: SVGElement): Element {
	// `nextSibling` alone might point to an empty TextNode before an element, if there’s an element
	const userLocation = nextElementSibling ?? nextSibling as Element;

	const locationName = userLocation.textContent.trim();
	const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationName)}`;

	userLocation.before(' '); // Keeps the link’s underline from extending out to the icon
	const link = <a className="Link--primary" href={googleMapsLink} />;

	if (userLocation.parentElement!.closest('.Popover')) {
	// Match the style of other links in the hovercard
		link.classList.add('text-underline');
	}

	wrap(userLocation, link);

	return link;
}

function initOnce(): void {
	observe([
		'[itemprop="homeLocation"] svg.octicon-location', // `isUserProfile`
		'.pagehead .has-location svg.octicon-location', // `isOrganizationProfile`
		':is([aria-label="User location"], [aria-label="Organization Hovercard"]) svg.octicon-location', // Hover cards
	], addLocation);
}

void features.add(import.meta.url, {
	// No `include` necessary
	init: onetime(initOnce),
});

/*

Test URLs

- isUserProfile: https://github.com/docubot
- isOrganizationProfile: https://github.com/github
- Hover cards: https://github.com/

*/
