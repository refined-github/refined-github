import select from 'select-dom';
import {applyToLink} from 'shorten-repo-url';
import {linkifiedURLClass} from './linkify-urls-in-code';

export default function () {
	for (const a of select.all(`a[href]:not(.${linkifiedURLClass})`)) {
		applyToLink(a, location.href);
	}
}
