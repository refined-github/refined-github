import {h} from 'dom-chef';
import select from 'select-dom';
import {clock} from '../libs/icons';
import observeEl from '../libs/simplified-element-observer';

function getMapsApi(name, params) {
	return `https://maps.googleapis.com/maps/api/${name}/json?` + new URLSearchParams(params);
}

async function parseAddress(address) {
	const locationRequest = await fetch(getMapsApi('geocode', {address}));
	const {results: [parsedLocation]} = await locationRequest.json();

	if (!parsedLocation) {
		return false;
	}

	const {lat, lng} = parsedLocation.geometry.location;

	const timezoneRequest = await fetch(getMapsApi('timezone', {
		location: [lat, lng],
		timestamp: Math.floor(Date.now() / 1000),
		sensor: false
	}));

	const {rawOffset, dstOffset} = await timezoneRequest.json();

	return new Date().getTimezoneOffset() + ((rawOffset + dstOffset) / 60);
}

const locationOffsets = new Map();

async function getTimezoneOffset(location) {
	const wasCached = locationOffsets.has(location);
	if (!wasCached) {
		// Store whether it's an offset or if it's non-existent
		locationOffsets.set(location, await parseAddress(location));
	}
	return [wasCached, locationOffsets.get(location)];
}

async function updateHovercard() {
	if (select.exists('.Popover .mt-2 .octicon-clock')) {
		return;
	}

	const locationIcon = select('.Popover .octicon-location');
	if (!locationIcon) {
		return;
	}
	const location = locationIcon.nextSibling.textContent.trim();
	const [wasCached, timezoneOffset] = await getTimezoneOffset(location);
	if (timezoneOffset === false) {
		return;
	}
	const date = new Date(Date.now() + (timezoneOffset * 60 * 1000));

	locationIcon.parentElement.append(
		<span class={`ml-5 ${wasCached ? '' : 'rgh-fade-in'}`}>
			{clock()}
			{`${date.getHours()}:${(date.getMinutes() < 10 ? '0' : '') + date.getMinutes()}`}
		</span>
	);
}

export default async function () {
	observeEl('.Popover-message', updateHovercard);
}
