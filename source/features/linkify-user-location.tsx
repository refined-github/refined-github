import React from 'dom-chef';
import select from 'select-dom';
import {wrap} from '../libs/dom-utils';
import features from '../libs/features';

function addLocation(baseElement: HTMLElement): void {
	const location = select('.octicon-location', baseElement)?.nextSibling;
	if (!location) {
		return;
	}

	const locationName = location.textContent!.trim();
	const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationName)}`;

	wrap(location, <a href={googleMapsLink} className="text-gray" />);
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

features.add({
	id: __featureName__,
	description: 'Linkifies the user location in their hovercard and profile page.',
	screenshot: 'https://user-images.githubusercontent.com/44227187/68993158-809e1780-087d-11ea-9e22-de82da8aef29.png',
	load: features.onAjaxedPages,
	init
});
