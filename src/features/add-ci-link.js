import select from 'select-dom';
import domify from '../libs/domify';
import {getRepoURL} from '../libs/page-detect';

// This var will be:
// - undefined on first load
// - a Promised dom element after a successful fetch
// - false after a failed fetch
let request;

async function fetchStatus() {
	const url = `${location.origin}/${getRepoURL()}/commits/`;
	const dom = await fetch(url).then(r => r.text()).then(domify);

	const icon = select('.commit-build-statuses', dom);

	// This will error if the element isn't found.
	// It's caught later.
	icon.classList.add('rgh-ci-link');

	return icon;
}

export default async function () {
	// Avoid duplicates and avoid on pages that already failed to load
	if (request === false || select.exists('.rgh-ci-link')) {
		return;
	}

	try {
		if (request) {
			// Skip icon re-animation because
			// it was probably already animated once
			(await request).style.animation = 'none';
		} else {
			request = fetchStatus();
		}
		select('.pagehead [itemprop="name"]').append(await request);
	} catch (err) {
		// Network failure or no CI status found.
		// Don’t try again
		request = false;
	}
}
