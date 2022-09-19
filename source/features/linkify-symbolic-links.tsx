import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils';
import features from '.';

function init(): void {
	if (select('.file-mode')?.textContent === 'symbolic link') {
		const line = select('.js-file-line')!;
		wrap(line.firstChild!, <a href={line.textContent!} data-pjax="#repo-content-pjax-container"/>);
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isSingleFile,
	],
	deduplicate: 'has-rgh',
	init,
});
