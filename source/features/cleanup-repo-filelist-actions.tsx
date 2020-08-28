import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import {observe} from 'selector-observer';
import PlusIcon from 'octicon/plus.svg';
import SearchIcon from 'octicon/search.svg';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {groupButtons} from '../github-helpers/group-buttons';

function init(): void {
  observe('.btn[data-hotkey="t"]', {
		add(searchButton) {
			searchButton.classList.add('tooltipped', 'tooltipped-ne');
			searchButton.setAttribute('aria-label', 'Go to file');
			searchButton.firstChild!.replaceWith(<SearchIcon/>);

			const addButtonWrapper = searchButton.nextElementSibling!;
			const addButton = select('.dropdown-caret', addButtonWrapper)?.parentElement;
			if (addButton) {
				addButton.classList.add('d-md-block', 'tooltipped', 'tooltipped-ne');
				addButton.classList.remove('d-md-flex', 'ml-2');
				addButton.setAttribute('aria-label', 'Add file');
				addButton.textContent = '';
				addButton.append(<PlusIcon/>);

				searchButton.classList.remove('mr-2');
				groupButtons([searchButton, addButtonWrapper]);
			}
		}
	});

	observe('get-repo details', {
		add(downloadButton) {
			downloadButton.classList.add('tooltipped', 'tooltipped-ne');
			downloadButton.setAttribute('aria-label', 'Clone or download');
			select('.octicon-download', downloadButton)!.nextSibling!.remove();
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
	waitForDomReady: false,
	init: onetime(init)
});
