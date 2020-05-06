import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import features from '../libs/features';
import {getRepoURL} from '../libs/utils';

function init(): false | void {
	const uploadFilesButton = select(`.file-navigation a[href^="/${getRepoURL()}/upload"]`);
	if (!uploadFilesButton) {
		return false;
	}

	uploadFilesButton.remove();
}

features.add({
	id: __filebasename,
	description: 'Remove the "Upload files" button',
	screenshot: false
}, {
	include: [
		pageDetect.isRepoTree
	],
	repeatOnAjax: false,
	init
});
