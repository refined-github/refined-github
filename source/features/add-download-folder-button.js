import {h} from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from '../libs/page-detect';

export default () => {
	if (pageDetect.isRepoTree()) {
		const buttonGroup = select(`.file-navigation .BtnGroup.float-right`);
		if (buttonGroup && !select.exists('.rgh-download-folder')) {
			buttonGroup.prepend(
				<a
					class="btn btn-sm BtnGroup-item rgh-download-folder"
					href={`https://download-directory.github.io/?url=${location.href}`}>
					Download
				</a>);
		}
	}
};
