import {h} from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from '../libs/page-detect';

export default () => {
	// Add to folder listings, excluding the repo root (that already has an official download ZIP button)
	if (pageDetect.isRepoTree() && !pageDetect.isRepoRoot()) {
		const buttonGroup = select('.file-navigation .BtnGroup.float-right');
		if (buttonGroup) {
			buttonGroup.prepend(
				<a
					class="btn btn-sm BtnGroup-item"
					href={`https://download-directory.github.io/?url=${location.href}`}>
					Download
				</a>
			);
		}
	}
};
