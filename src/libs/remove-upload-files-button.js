import select from 'select-dom';
import * as pageDetect from './page-detect';

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
