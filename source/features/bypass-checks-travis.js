import select from 'select-dom';
import domify from '../libs/domify';

export default function () {
	for (const check of select.all('[href="/apps/travis-ci"]')) {
		const details = select('.status-actions', check.parentNode);
		bypassCheck(details);
	}
}

async function bypassCheck(details) {
	const response = await fetch(details.href, {
		credentials: 'include'
	});

	if (response.ok) {
		const dom = domify(await response.text());
		const directLink = select('[href^="https://travis-ci.com"].text-small', dom);
		details.href = directLink.href;
	}
}
