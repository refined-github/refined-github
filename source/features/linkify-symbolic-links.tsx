import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils';
import features from '.';

function init(): void {
	if (select('.file-mode')?.textContent === 'symbolic link') {
		const line = select('.js-file-line')!;
		wrap(line.firstChild!, <a href={line.textContent!}/>);
	}
}

void features.add({
	id: __filebasename,
	description: 'Linkifies symbolic links files.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/62036664-6d0e6880-b21c-11e9-9270-4ae30cc10de2.png'
}, {
	include: [
		pageDetect.isSingleFile
	],
	init
});
