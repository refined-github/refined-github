import {h} from 'dom-chef';
import select from 'select-dom';
import {groupSiblings} from '../libs/group-buttons';
import observeEl from '../libs/simplified-element-observer';

function addFilePathCopyBtn() {
	for (const file of select.all('#files .file-header:not(.rgh-copy-file-path)')) {
		file.classList.add(
			'rgh-copy-file-path',
			'js-zeroclipboard-container'
		);

		select('.file-info a', file).classList.add('js-zeroclipboard-target');

		const viewButton = select('[aria-label^="View"]', file);
		viewButton.before(
			<button aria-label="Copy file path to clipboard" class="js-zeroclipboard btn btn-sm tooltipped tooltipped-s" data-copied-hint="Copied!" type="button">Copy path</button>
		);
		groupSiblings(viewButton);
	}
}

export default () => {
	observeEl('#files', addFilePathCopyBtn, {childList: true, subtree: true});
};
