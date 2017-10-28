import select from 'select-dom';
import {h} from 'dom-chef';
import {groupButtons} from './utils';

export default function () {
	// This selector skips binaries + markdowns with code
	for (const code of select.all('.file .blob-wrapper > .highlight:not(.rgh-copy-file)')) {
		code.classList.add('rgh-copy-file');
		const file = code.closest('.file');

		// Enable copy behavior
		file.classList.add('js-zeroclipboard-container');
		code.classList.add('js-zeroclipboard-target');

		// Prepend to list of buttons
		const firstAction = select('.file-actions .btn', file);
		firstAction.before(
			<button class="btn btn-sm copy-btn js-zeroclipboard tooltipped tooltipped-n" aria-label="Copy file to clipboard" data-copied-hint="Copied!" type="button">Copy</button>
		);

		// Group buttons if necessary
		groupButtons(firstAction.parentNode.children);
	}
}
