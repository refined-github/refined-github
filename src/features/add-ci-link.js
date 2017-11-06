import select from 'select-dom';
import domify from '../libs/domify';
import {getRepoURL} from '../libs/page-detect';

// This var will be:
// undefined on first load
// a dom element after a successful fetch
// false after a failed fetch
let status;

export default async function () {
	// Avoid duplicates and avoid on pages that already failed to load
	if (select.exists('.rgh-ci-link') || status === false) {
		return;
	}

	if (status) {
		// If truthy, we're in an ajaxed:load event
		// Skip status re-animation
		status.style.animation = 'none';
	} else {
		// It's undefined, we're displaying it for the first time
		try {
			const html = await fetch(`${location.origin}/${getRepoURL()}/commits/`).then(r => r.text());
			status = select('.commit-build-statuses', domify(html));
			status.classList.add('rgh-ci-link');
		} catch (err) {
			// Network failure or missing element
			status = false;
			return;
		}
	}

	select('.pagehead [itemprop="name"]').append(status);
}
