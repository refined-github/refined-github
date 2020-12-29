import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import {wrap} from '../helpers/dom-utils';
import features from '.';

function init(): void {
	if ($('.file-mode')?.textContent === 'symbolic link') {
		const line = $('.js-file-line')!;
		wrap(line.firstChild!, <a href={line.textContent!}/>);
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isSingleFile
	],
	init
});
