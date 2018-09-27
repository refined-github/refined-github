/*
This feature adds more useful 404 (not found) page.
- Display the full URL clickable piece by piece
- Strikethrough all anchor that return a 404 status code
*/

import {h} from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from '../libs/page-detect';

const flatMap = (arr, fn) =>
	arr.flatMap ?
		arr.flatMap(fn) :
		arr.reduce((acc, ...args) => acc.concat(fn(...args)), []);

const strikethrough = target => {
	const wrapper = <del style={{color: '#6a737d'}} />;
	for (const child of target.childNodes) {
		wrapper.appendChild(child);
	}
	return target.appendChild(wrapper);
};

const checkAnchor = async anchor => {
	const {status} = await fetch(anchor.href, {method: 'head'});
	if (status === 404) {
		strikethrough(anchor);
	}
	return anchor;
};

const ignoredPathParts = ['tree', 'blob'];
const buildAnchors = () =>
	pageDetect
		.getCleanPathname()
		.split('/')
		.filter(part => !ignoredPathParts.includes(part))
		.map((part, index, parts) => {
			const pathname = `/${parts.slice(0, index + 1).join('/')}`;

			const anchor = <a href={pathname}>{part}</a>;
			// NOTE: Asyncronoulsy check the path and strikethrough if it isn't reachable
			checkAnchor(anchor);
			return anchor;
		});

export default function () {
	const anchors = buildAnchors();
	if (anchors.length === 0) {
		return;
	}

	// NOTE: We need to append it after the parallax_wrapper because other elements might not be available yet.
	return select('#parallax_wrapper').after(
		<div className="container">
			<h3>Do. Or do not. There is no try.</h3>
			<h2>{flatMap(anchors, (e, i) => (i === 0 ? [e] : [' / ', e]))}</h2>
		</div>
	);
}
