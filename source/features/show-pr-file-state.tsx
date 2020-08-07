import React from 'dom-chef';
import select from 'select-dom';
import {observe} from 'selector-observer';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import DiffAddedIcon from 'octicon/diff-added.svg';
import DiffRemovedIcon from 'octicon/diff-removed.svg';
import DiffModifiedIcon from 'octicon/diff-modified.svg';

import features from '.';
import fetchDom from '../helpers/fetch-dom';

async function init(): Promise<false | void> {
	const jumpList = await elementReady('details [src*="show_toc"]')!;
	const src = jumpList!.getAttribute('src')!;
	const fileList = await fetchDom(src, '[data-filterable-for]');

	const list = new Map();
	for (const file of select.all('a', fileList)) {
		const fileStatus = [...file.firstElementChild!.classList].find(iconClass => iconClass.includes('diff'));
		list.set(file.hash, fileStatus);
	}

	observe('.file-info [href]', {
		constructor: HTMLAnchorElement,
		add(element) {
			const icon: Record<string, Element> = {
				'octicon-diff-added': <DiffAddedIcon color="#28a745" className="d-inline-block mx-1"/>,
				'octicon-diff-removed': <DiffRemovedIcon color="#cb2431" className="d-inline-block mx-1"/>,
				'octicon-diff-modified': <DiffModifiedIcon color="#dbab09" className="d-inline-block mx-1"/>
			};

			element.before(icon[list.get(element.hash)]);
		}
	});
}

void features.add({
	id: __filebasename,
	description: '',
	screenshot: ''
}, {
	include: [
		pageDetect.isPRFiles

	],
	init,
	waitForDomReady: false
});
