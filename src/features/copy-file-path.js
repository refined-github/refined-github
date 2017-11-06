import select from 'select-dom';
import {h} from 'dom-chef';
import {observeEl} from '../libs/utils';

function addFilePathCopyBtn() {
	for (const file of select.all('#files .file-header:not(.rgh-copy-file-path)')) {
		file.classList.add(
			'rgh-copy-file-path',
			'js-zeroclipboard-container'
		);

		select('.file-info a', file).classList.add('js-zeroclipboard-target');

		const group = (
			<div class="BtnGroup">
				<button aria-label="Copy file path to clipboard" class="js-zeroclipboard btn btn-sm BtnGroup-item tooltipped tooltipped-s" data-copied-hint="Copied!" type="button">Copy path</button>
			</div>
		);
		const viewButton = select('[aria-label^="View"]', file);
		viewButton.classList.add('BtnGroup-item');
		viewButton.replaceWith(group);
		group.append(viewButton);
	}
}

export default () => {
	observeEl('#files', addFilePathCopyBtn, {childList: true, subtree: true});
};
