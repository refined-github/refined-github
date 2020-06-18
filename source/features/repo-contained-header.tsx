import './repo-contained-header.css';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	const actionsContainer = select('.pagehead > div');
	const pageHead = select('.pagehead');
	const nav = select('.repohead nav');

	// Detect repository refresh
	if (!pageHead?.classList.contains('mb-5')) {
		return;
	}

	actionsContainer?.classList.add('container-xl');
	pageHead?.classList.remove('border-0');
	pageHead?.classList.remove('mb-5');
	pageHead?.classList.add('rg-repo-contained-header');
	nav?.classList.add('container-xl');
	nav?.classList.remove('UnderlineNav');
}

void features.add({
	id: __filebasename,
	description: 'Places the repo header in a container (requires "repository refresh" to be enabled)',
	screenshot: 'https://user-images.githubusercontent.com/2395597/85006314-88fc5f00-b18c-11ea-868b-a074d7bfd10c.png'
}, {
	include: [
		pageDetect.isRepo
	],
	init
});
