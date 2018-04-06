import select from 'select-dom';
import moment from 'moment-timezone';
import domify from '../libs/domify';

function createTimezoneRequestURL(lat, lng) {
	const timezoneAPI = 'https://maps.googleapis.com/maps/api/timezone/json?location=';
	return `${timezoneAPI}${lat},${lng}&timestamp=1331161200&sensor=false`;
}

async function getTimezone(location) {
	const locationAPI = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
	const locationRequest = await fetch(
		`${locationAPI}${encodeURIComponent(location)}`
	);
	const locationResponse = await locationRequest.json();

	try {
		const {lat, lng} = locationResponse.results[0].geometry.location;
		const timezoneRequest = await fetch(createTimezoneRequestURL(lat, lng));
		const timezoneResponse = await timezoneRequest.json();

		return timezoneResponse;
	} catch (error) {
		return null;
	}
}

function traverseNodelist(node, positionList, i) {
	// NodeLists are live and must be converted to arrays
	if (i === positionList.length - 1) {
		return Array.from(node[positionList[i]].childNodes);
	}

	// Traverse down the tree to the desired div
	return traverseNodelist(
		Array.from(node[positionList[i]].childNodes),
		positionList,
		i + 1
	);
}

function getLocationFromHovercard(node) {
	// These are locations of NodeLists nested in other NodeLists
	const nodePositions = [0, 0, 5, 3, 7];
	const target = traverseNodelist(node, nodePositions, 0);
	return target[2].textContent.trim();
}

export default async function () {
	const observer = new MutationObserver(async mutationsList => {
		let hoverCardMutation;
		for (const mutation of mutationsList) {
			if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
				hoverCardMutation = mutation;
				break;
			}
		}

		try {
			const location = getLocationFromHovercard(
				Array.from(hoverCardMutation.addedNodes)
			);

			// There will only be a single hoverCard at any time
			const hoverCard = select('div.mt-2.text-gray.text-small');
			const timeZone = await getTimezone(location);

			if (timeZone) {
				const {timeZoneId} = timeZone;
				const time = moment.tz(moment(), timeZoneId).format('HH:mm');
				const abbr = moment.tz(timeZoneId).zoneAbbr();
				hoverCard.appendChild(domify(`${time} ${abbr}`));
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
