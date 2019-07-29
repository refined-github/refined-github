import React from 'dom-chef';
import select from 'select-dom';
import {wrap} from '../libs/dom-utils';
import features from '../libs/features';

function init(): void | false {
	const mode = select('.file-mode');
	if (mode && mode.textContent === 'symbolic link') {
		const line = select('.js-file-line')!;
		wrap(line.firstChild!, <a href={line.textContent!} />);
	}
}

features.add({
	id: __featureName__,
	description: 'Linkify symbolic link files',
	include: [
		features.isSingleFile
	],
	load: features.onAjaxedPages,
	init
});
