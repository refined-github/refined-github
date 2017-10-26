import select from 'select-dom';
import {h} from 'dom-chef';

export default function () {
	// This selector skips binary files
	for (const code of select.all('.file .highlight:not(.rgh-gist-copy)')) {
		const file = code.closest('.file');
		file.classList.add('rgh-gist-copy');
		file.classList.add('js-zeroclipboard-container');
		code.classList.add('js-zeroclipboard-target');
		select('.file-actions', file).prepend(
			<button class="btn btn-sm copy-btn gist-copy-btn js-zeroclipboard tooltipped tooltipped-n" aria-label="Copy file to clipboard" data-copied-hint="Copied!" type="button">Copy</button>
		);
	}
}
