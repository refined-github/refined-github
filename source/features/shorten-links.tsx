import select from 'select-dom';
import {applyToLink} from 'shorten-repo-url';
import features from '../libs/features';
import {linkifiedURLClass} from './linkify-urls-in-code';

function init() {
	for (const a of select.all(`a[href]:not(.${linkifiedURLClass})`)) {
		applyToLink(a, location.href);
	}
}

features.add({
	id: 'shorten-links',
	description: 'Repo URLs are shortened to readable references like `_user/repo/.file@d71718d`',
	load: features.onAjaxedPages,
	init
});
