import {h} from 'dom-chef';
import select from 'select-dom';
import moment from 'moment-timezone';
import domify from '../libs/domify';
import {clock} from '../libs/icons';

function createTimezoneRequestURL(lat, lng) {
	const timezoneAPI = 'https://maps.googleapis.com/maps/api/timezone/json?location=';
	return `${timezoneAPI}${lat},${lng}&timestamp=${Date.now() / 1000}&sensor=false`;
}

async function getTimezone(location) {
	const locationAPI = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
	const locationRequest = await fetch(
		`${locationAPI}${encodeURIComponent(location)}`
	);
	const locationResponse = await locationRequest.json();

	const {lat, lng} = locationResponse.results[0].geometry.location;
	const timezoneRequest = await fetch(createTimezoneRequestURL(lat, lng));
	const timezoneResponse = await timezoneRequest.json();

	return timezoneResponse;
}

export default async function () {
	const observer = new MutationObserver(async () => {
		try {
			const location = select('.Popover .octicon-location').nextSibling.textContent.trim();

			// There will only be a single hoverCard at any time
			const hoverCard = select('div.mt-2.text-gray.text-small');
			const timeZone = await getTimezone(location);

			if (timeZone) {
				const {timeZoneId} = timeZone;
				const time = moment.tz(moment(), timeZoneId).format('HH:mm');
				const abbr = moment.tz(timeZoneId).zoneAbbr();

				hoverCard.append(clock(), domify(`${time} ${abbr}`));
			}
		} catch (e) {
			// Silently fail when there are too many API requests
		}
	});

	observer.observe(document.querySelector('div.Popover-message'), {
		attributes: true,
		childList: true
	});
}
