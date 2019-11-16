import React from 'dom-chef';
import select from 'select-dom';
import {wrap} from '../libs/dom-utils';
import features from '../libs/features';

function addLocation(baseElement?: HTMLElement): void {
	const locationIcon = select('.octicon-location', baseElement)!;

	if (!locationIcon) {
		return;
	}

	const location = locationIcon.parentElement!.textContent!.trim();
	const googleMapsLink = `https://www.google.com/maps/place/${encodeURIComponent(location)}/`;

	wrap(locationIcon.nextElementSibling || locationIcon.nextSibling!, <a href={googleMapsLink} />);
}

const hovercardObserver = new MutationObserver(([mutation]) => {
	addLocation(mutation.target as HTMLElement);
});

function init(): void | false {
	if (features.isUserProfile()) {
		for (const profileElement of select.all('.js-profile-editable-area')) {
			addLocation(profileElement);
		}
	}

	if (features.isOrganizationProfile()) {
		addLocation(select('.orghead')!);
	}

	const hovercardContainer = select('.js-hovercard-content > .Popover-message')!;
	if (hovercardContainer) {
		hovercardObserver.observe(hovercardContainer, {childList: true});
	}
}

features.add({
	id: __featureName__,
	description: 'Linkifies user location.',
	screenshot: '',
	include: [() => true],
	load: features.onAjaxedPages,
	init
});
