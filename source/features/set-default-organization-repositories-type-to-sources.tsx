import select from 'select-dom';
import features from '../libs/features';

function init() {
	const links = select.all<HTMLAnchorElement>([
		'[data-hovercard-type="organization"]', // Handles breadcrumb nav on repository if org, and users profile org list
		'nav.orgnav a.pagehead-tabs-item' // Nav menu item on org "profile"
	].join());

	for (const link of links) {
		link.search += '&type=source';
	}
}

features.add({
	id: 'set-default-organization-repositories-type-to-sources',
	load: features.onAjaxedPages,
	init
});
