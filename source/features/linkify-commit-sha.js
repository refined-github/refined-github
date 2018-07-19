import {h} from 'dom-chef';
import * as pageDetect from '../libs/page-detect';
import { wrap } from '../libs/utils';
import select from 'select-dom';

export default function () {
	let commitUrl = location.pathname.replace(/\/$/, '');
	commitUrl = commitUrl.replace(/\/pull\/\d+\/commits/, '/commit');

	const el = select('.sha-block:not(.patch-diff-links) .sha');
	if (el) {
		wrap(el, <a href={commitUrl}></a>);
	}
}
