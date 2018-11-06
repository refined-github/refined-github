import {h} from 'dom-chef';
import select from 'select-dom';
import copyToClipboard from 'copy-text-to-clipboard';
import {groupSiblings} from '../libs/group-buttons';

export default function () {
	// This selector skips binaries + markdowns with code
	for (const code of select.all('.file .blob-wrapper > .highlight:not(.rgh-copy-file)')) {
		code.classList.add('rgh-copy-file');
		const file = code.closest('.file');

		const content = select.all('.blob-code-inner', file)
			.map(blob => blob.innerText)
			.map(line => line === '\n' ? '' : line)
			.join('\n');

		const handleClick = () => {
			copyToClipboard(content);
		};

		// Prepend to list of buttons
		const firstAction = select('.file-actions .btn', file);
		if (firstAction) {
			firstAction.before(
				<button onClick={handleClick} class="btn btn-sm copy-btn tooltipped tooltipped-n" aria-label="Copy file to clipboard" type="button">Copy</button>
			);

			// Group buttons if necessary
			groupSiblings(firstAction);
		}
	}
}
