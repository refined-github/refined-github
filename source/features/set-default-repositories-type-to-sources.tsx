import select from 'select-dom';
import features from '../libs/features';

function init() {
	const links = select.all<HTMLAnchorElement>([
		'.user-profile-nav [href$="tab=repositories"]', // "Your repositories" in header dropdown
		'#user-links [href$="tab=repositories"]' // "Repositories" tab on profile
	].join());

	for (const link of links) {
		link.search += '&type=source';
	}
}

features.add({
	id: 'set-default-repositories-type-to-sources',
	description: 'Set default repositories type to sources',
	load: features.onAjaxedPages,
	init
});
