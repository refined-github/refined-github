import select from 'select-dom';
import {applyToLink} from 'shorten-repo-url';
import features from '../libs/features';
import {linkifiedURLClass} from '../libs/linkify-text-nodes';

function init(): void {
	for (const a of select.all<HTMLAnchorElement>(`a[href]:not(.${linkifiedURLClass})`)) {
		applyToLink(a, location.href);
	}
}

features.add({
	id: 'shorten-links',
	description: 'Repository URLs are shortened to readable references like `user/repo/.file@d71718d`',
	load: features.onAjaxedPages,
	init
});
