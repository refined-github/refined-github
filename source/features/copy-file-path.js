import {h} from 'dom-chef';
import select from 'select-dom';
import copyToClipboard from 'copy-text-to-clipboard';
import {groupSiblings} from '../libs/group-buttons';
import observeEl from '../libs/simplified-element-observer';

function addFilePathCopyBtn() {
	for (const file of select.all('#files .file-header:not(.rgh-copy-file-path)')) {
		file.classList.add('rgh-copy-file-path');

		select('.file-info a', file).classList.add('js-copy-btn-target');
		const handleClick = e => {
			e.preventDefault();
			const fileContents = select('.js-copy-btn-target', file).innerText;
			if (copyToClipboard(fileContents)) {
				console.log('Copy success');
			} else {
				console.log('COPY FAILED!');
			}
		};

		const viewButton = select('[aria-label^="View"]', file);
		viewButton.before(
			<button onClick={handleClick} aria-label="Copy file path to clipboard" class="copy-btn btn btn-sm tooltipped tooltipped-s" type="button">Copy path</button>
		);
		groupSiblings(viewButton);
	}
}

export default () => {
	observeEl('#files', addFilePathCopyBtn, {childList: true, subtree: true});
};
