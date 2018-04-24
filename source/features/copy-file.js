import select from 'select-dom';
import {h} from 'dom-chef';
import copyToClipboard from 'copy-text-to-clipboard';
import {groupSiblings} from '../libs/group-buttons';

export default function () {
	// This selector skips binaries + markdowns with code
	for (const code of select.all('.file .blob-wrapper > .highlight:not(.rgh-copy-file)')) {
		code.classList.add('rgh-copy-file');
		const file = code.closest('.file');

		// Enable copy behavior
		code.classList.add('js-copy-btn-target');
		const handleClick = e => {
			e.preventDefault();
			const fileContents = select('.js-copy-btn-target', file).innerText;
			if (copyToClipboard(fileContents)) {
				console.log('Copy success');
			} else {
				console.log('COPY FAILED!');
			}
		};

		// Prepend to list of buttons
		const firstAction = select('.file-actions .btn', file);
		firstAction.before(
			<button onClick={handleClick} class="btn btn-sm copy-btn tooltipped tooltipped-n" aria-label="Copy file to clipboard" type="button">Copy</button>
		);

		// Group buttons if necessary
		groupSiblings(firstAction);
	}
}
