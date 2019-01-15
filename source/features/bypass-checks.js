import select from 'select-dom';
import domify from '../libs/domify';
import features from '../libs/features';

async function init() {
	// If anything errors, RGH will display the error next to the feature name
	await Promise.all(select.all('.merge-status-item [href^="/apps/"]').map(bypass));
}

async function bypass(check) {
	const details = select('.status-actions', check.parentNode);
	const response = await fetch(details.href);
	const dom = domify(await response.text());
	const directLink = select('a.text-small .octicon-link-external', dom);
	details.href = directLink.parentNode.href;
}

features.add({
	id: 'bypass-checks',
	include: [
		features.isPRConversation
	],
	load: features.onAjaxedPages,
	init
});
