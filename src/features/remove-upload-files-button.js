import select from 'select-dom';
import * as pageDetect from '../libs/page-detect';

const repoUrl = pageDetect.getRepoURL();

export default () => {
	if (pageDetect.isRepoRoot()) {
		const uploadFilesButton = select(`.file-navigation a[href^="/${repoUrl}/upload"]`);
		if (uploadFilesButton) {
			uploadFilesButton.remove();
		}
	}
};
