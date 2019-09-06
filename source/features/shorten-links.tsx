import select from 'select-dom';
import {applyToLink} from 'shorten-repo-url';
import features from '../libs/features';
import {linkifiedURLClass} from '../libs/dom-formatters';

function init(): void {
	for (const a of select.all<HTMLAnchorElement>(`a[href]:not(.${linkifiedURLClass})`)) {
		applyToLink(a, location.href);
	}
}

features.add({
	id: __featureName__,
	description: 'Shortens URLs and repo URLs to readable references like "_user/repo/.file@`d71718d`".',
	screenshot: 'https://user-images.githubusercontent.com/1402241/27252232-8fdf8ed0-538b-11e7-8f19-12d317c9cd32.png',
	load: features.onAjaxedPages,
	init
});
