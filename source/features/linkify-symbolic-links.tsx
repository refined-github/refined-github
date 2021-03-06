/** @jsx h */
import {h} from 'preact';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import render from '../helpers/render';

import {wrap} from '../helpers/dom-utils';
import features from '.';

function init(): void {
	if (select('.file-mode')?.textContent === 'symbolic link') {
		const line = select('.js-file-line')!;
		wrap(line.firstChild!, <a href={line.textContent!}/>);
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isSingleFile
	],
	init
});
