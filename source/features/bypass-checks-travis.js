import select from 'select-dom';
import domify from '../libs/domify';

export default () => {
	const checks = select.all('.merge-status-item');
	const checkTravisBranch = checks.find(isTravisBranchCheck);
	const checkTravisPR = checks.find(isTravisPRCheck);

	if (checkTravisBranch) {
		bypassCheck(checkTravisBranch);
	}
	if (checkTravisPR) {
		bypassCheck(checkTravisPR);
	}
};

async function bypassCheck(check) {
	const details = select('.status-actions', check);
	const checkUrl = details.getAttribute('href');

	const response = await fetch(checkUrl, {
		credentials: 'include'
	});

	if (response.ok) {
		const dom = domify(await response.text());
		const links = select.all('[id^="check_run_"] a', dom);
		const viewMoreLink = links.find(isViewMoreLink);

		if (viewMoreLink) {
			details.href = viewMoreLink.href;
			details.rel = viewMoreLink.rel;
			details.target = viewMoreLink.target;
		}
	}
}

function isTravisPRCheck(check) {
	return /Travis CI - Pull Request/.test(check.textContent);
}

function isTravisBranchCheck(check) {
	return /Travis CI - Branch/.test(check.textContent);
}

function isViewMoreLink(link) {
	return /View more details on Travis CI/.test(link.textContent);
}
