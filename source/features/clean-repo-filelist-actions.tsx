import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import PlusIcon from 'octicon/plus.svg';
import SearchIcon from 'octicon/search.svg';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	observe('.btn[data-hotkey="t"]:not(.rgh-clean-actions)', {
		add(searchButton) {
			searchButton.classList.add('tooltipped', 'tooltipped-ne', 'rgh-clean-actions');
			searchButton.setAttribute('aria-label', 'Go to file');
			searchButton.firstChild!.replaceWith(<SearchIcon/>);

			const addButtonWrapper = searchButton.nextElementSibling!;
			if (addButtonWrapper.nodeName === 'DETAILS') {
				addButtonWrapper.classList.add('tooltipped', 'tooltipped-ne');
				addButtonWrapper.setAttribute('aria-label', 'Add file');

				const addIcon = select('.btn span', addButtonWrapper)!;
				addIcon.classList.replace('d-md-flex', 'd-md-block');
				addIcon.firstChild!.replaceWith(<PlusIcon/>);
			}
		}
	});

	observe('get-repo .octicon-download:not(.rgh-clean-actions)', {
		add(icon) {
			icon.parentElement!.classList.add('tooltipped', 'tooltipped-ne', 'rgh-clean-actions');
			icon.parentElement!.setAttribute('aria-label', 'Clone or download');
			icon.nextSibling!.remove();
		}
	});
}

void features.add({
	id: __filebasename,
	description: 'Replaces the labels of some simple buttons on repository filelists with icons, making them take less space.',
	screenshot: 'https://user-images.githubusercontent.com/44045911/88551471-7a3f7c80-d055-11ea-82f1-c558b7871824.png'
}, {
	include: [
		pageDetect.isRepoTree,
		pageDetect.isSingleFile
	],
	exclude: [
		pageDetect.isEmptyRepo
	],
	init: onetime(init)
});
