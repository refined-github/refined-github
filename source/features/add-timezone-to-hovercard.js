import {h} from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate';
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
	delegate('[data-hydro-view]', 'view', async () => {
		if (!select.exists('.Popover .mt-2 .octicon-clock')) {
			const hoverCard = select('div.mt-2.text-gray.text-small');
			const username = select('.Popover a.link-gray.no-underline.ml-1').textContent;
			const now = new Date(Date.now());

			if (document.body.hasAttribute(`timezone-${username}`)) {
				const date = new Date(now.getTime() + (document.body.getAttribute(`timezone-${username}`) * 60 * 1000));
				const time = `${date.getHours()}:${date.getMinutes()}`;
				hoverCard.append(clock(), domify(time));
				return;
			}

			try {
				const location = select('.Popover .octicon-location').nextSibling.textContent.trim();
				const timeZone = await getTimezone(location);

				if (timeZone) {
					const {rawOffset, dstOffset} = timeZone;
					const timezoneOffset = now.getTimezoneOffset() + ((rawOffset + dstOffset) / 60);
					const date = new Date(now.getTime() + (timezoneOffset * 60 * 1000));
					const time = `${date.getHours()}:${date.getMinutes()}`;

					if (!select.exists('.Popover .mt-2 .octicon-clock')) {
						hoverCard.append(clock(), domify(time));
					}
					document.body.setAttribute(`timezone-${username}`, timezoneOffset);
				}
			} catch (error) {
				console.log(error);
			}
		}
	});
}
