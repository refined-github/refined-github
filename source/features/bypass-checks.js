import select from 'select-dom';
import domify from '../libs/domify';

export default async function () {
	// If anything errors, RGH will display the error next to the feature name
	await Promise.all(select.all('[href^="/apps/"]').map(bypass));
}

async function bypass(check) {
	// On the checks page, here is a link near the bottom that says 'View more details'.
	// This code finds that link an replaces the href of the 'details' link on the PR conversation page

	const details = select('.status-actions', check.parentNode);

	const response = await fetch(details.href);

	if (!response.ok) {
		return;
	}

	const dom = domify(await response.text());
	const directLink = select('a.text-small .octicon-link-external', dom);
	details.href = directLink.parentNode.href;
}
