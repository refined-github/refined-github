import domify from 'doma';
import select from 'select-dom';
import features from '../libs/features';

async function init() {
	// If anything errors, RGH will display the error next to the feature name
	await Promise.all(select.all('.merge-status-item [href^="/apps/"]').map(bypass));
}

async function bypass(check) {
	const details = select<HTMLAnchorElement>('.status-actions', check.parentElement);
	const response = await fetch(details.href);
	const dom = domify(await response.text());
	const directLink = select('a.text-small .octicon-link-external', dom);
	details.href = (directLink.parentElement as HTMLAnchorElement).href;
}

features.add({
	id: 'bypass-checks',
	description: 'Bypass the `Checks` page and go directly to build results when clicking the `Details` links on a PR',
	include: [
		features.isPRConversation
	],
	load: features.onAjaxedPages,
	init
});
