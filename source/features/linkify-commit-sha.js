import {h} from 'dom-chef';
import select from 'select-dom';
import {wrap} from '../libs/utils';

export default function () {
	let commitUrl = location.pathname.replace(/\/$/, '');
	commitUrl = commitUrl.replace(/\/pull\/\d+\/commits/, '/commit');

	const el = select('.sha-block:not(.patch-diff-links) .sha');
	if (el) {
		wrap(el, <a href={commitUrl}></a>);
	}
}
