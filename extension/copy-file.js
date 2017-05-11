/* globals utils */

'use strict';

window.addFileCopyButton = () => {
	// Button already added (partial page nav), or non-text file
	if ($('.copy-btn').length > 0 || $('[data-line-number="1"]').length === 0) {
		return;
	}

	const $targetSibling = $('#raw-url');
	const fileUri = $targetSibling.attr('href');
	$(`<a href="${fileUri}" class="btn btn-sm BtnGroup-item copy-btn">Copy</a>`).insertBefore($targetSibling);

	$(document).on('click', '.copy-btn', e => {
		e.preventDefault();
		const fileContents = $('.js-file-line-container').get(0).innerText;
		utils.copyToClipboard(fileContents);
	});
};

window.addFilePathCopyButton = () => {
	const $files = $('#files .file');
	$files.each((i, el) => {
		// Button already added
		if ($(el).find('.copy-filepath-btn').length > 0) {
			return;
		}
		const $fileUri = $(el).find('.file-header .file-info a');
		const filePath = $fileUri.attr('title');
		const copyButton = `
			<i href="#" class="tooltipped tooltipped-s copy-filepath-btn">
				<svg aria-hidden="true" class="octicon octicon-clippy" height="16" version="1.1" viewBox="0 0 14 16" width="14" aria-label="Copy to clipboard">
					<path fill-rule="evenodd" d="M2 13h4v1H2v-1zm5-6H2v1h5V7zm2 3V8l-3 3 3 3v-2h5v-2H9zM4.5 9H2v1h2.5V9zM2 12h2.5v-1H2v1zm9 1h1v2c-.02.28-.11.52-.3.7-.19.18-.42.28-.7.3H1c-.55 0-1-.45-1-1V4c0-.55.45-1 1-1h3c0-1.11.89-2 2-2 1.11 0 2 .89 2 2h3c.55 0 1 .45 1 1v5h-1V6H1v9h10v-2zM2 5h8c0-.55-.45-1-1-1H8c-.55 0-1-.45-1-1s-.45-1-1-1-1 .45-1 1-.45 1-1 1H3c-.55 0-1 .45-1 1z">
					</path>
				</svg>
			</i>`;
		$(copyButton)
			.insertAfter($fileUri)
			.mouseenter(e => {
				$(e.currentTarget).attr('aria-label', 'Copy to clipboard');
			})
			.on('click', e => {
				e.preventDefault();
				$(e.currentTarget).attr('aria-label', 'Copied!');
				utils.copyToClipboard(filePath);
			});
	});
};

