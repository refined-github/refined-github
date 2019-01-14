import select from 'select-dom';
import features from '../libs/features';
import {getRepoURL} from '../libs/page-detect';

function init() {
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
	load: features.domReady,
	init
});
