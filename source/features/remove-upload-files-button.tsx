import select from 'select-dom';
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
	id: 'remove-upload-files-button',
	include: [
		features.isRepoTree
	],
	load: features.onDomReady,
	init
});
