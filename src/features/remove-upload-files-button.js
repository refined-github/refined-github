import select from 'select-dom';
import * as pageDetect from '../libs/page-detect';

const repoUrl = pageDetect.getRepoURL();

export default () => {
	if (!pageDetect.isRepoRoot()) {
		return;
	}

	const uploadFilesButton = select(`a[href^="/${repoUrl}/upload"]`);
	if (uploadFilesButton) {
		uploadFilesButton.remove();
	}
};
