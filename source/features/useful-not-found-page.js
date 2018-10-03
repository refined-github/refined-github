/*
This feature adds more useful 404 (not found) page.
- Display the full URL clickable piece by piece
- Strikethrough all anchor that return a 404 status code
*/

import {h} from 'dom-chef';
import select from 'select-dom';
import {getCleanPathname} from '../libs/page-detect';

async function checkAnchor(anchor) {
	const {status} = await fetch(anchor.href, {method: 'head'});
	if (status === 404) {
		anchor.replaceWith(
			<del style={{color: '#6a737d'}}>{anchor.textContent}</del>
		);
	}
}

function parseCurrentURL() {
	const parts = getCleanPathname().split('/');
	if (parts[2] === 'blob') { // Blob URLs are never useful
		parts[2] = 'tree';
	}
	return parts;
}

async function createAdditionalLink(parts, bar) {
	if (parts[2] !== 'tree') {
		return;
	}
	parts[2] = 'commits';
	const url = '/' + parts.join('/');
	const {status} = await fetch(url, {method: 'head'});
	if (status === 404) {
		return;
	}
	bar.after(
		<p class="container">
			See also the file’s {<a href={url}>commit history</a>}
		</p>
	);
}

export default function () {
	const parts = parseCurrentURL();
	const bar = <h2 class="container" />;

	for (let i = 0; i < parts.length; i++) {
		const part = parts[i];
		if (i === 2 && part === 'tree') {
			continue;
		}
		const pathname = '/' + parts.slice(0, i + 1).join('/');
		bar.append(' / ', <a href={pathname}>{part}</a>);
	}

	// NOTE: We need to append it after the parallax_wrapper because other elements might not be available yet.
	select('#parallax_wrapper').after(bar);

	// Check parts from right to left
	for (let i = bar.children.length - 1; i >= 0; i--) {
		checkAnchor(bar.children[i]);
	}

	createAdditionalLink(parts, bar);
}
