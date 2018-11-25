import select from 'select-dom';
import domify from '../libs/domify';

export default async function () {
	// If anything errors, RGH will display the error next to the feature name
	await Promise.all(select.all('[href="/apps/travis-ci"]').map(bypass));
}

async function bypass(check) {
	const details = select('.status-actions', check.parentNode);

	const response = await fetch(details.href, {
		credentials: 'include'
	});

	if (response.ok) {
		const dom = domify(await response.text());
		const directLink = select('[href^="https://travis-ci.com"].text-small', dom);
		details.href = directLink.href;
	}
}
