import {h} from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';

function init() {
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

features.add({
	id: 'add-download-folder-button',
	dependencies: [
		features.and(
			features.isRepoTree,
			features.not(features.isRepoRoot) // Already has an native download ZIP button
		)
	],
	load: features.onAjaxedPages,
	init
});
