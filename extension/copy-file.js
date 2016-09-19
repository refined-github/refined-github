/* globals utils */

'use strict';

window.addFileCopyButton = () => {
	// Button already added (partial page nav), or non-text file
	if ($('.copy-btn').length || !$('[data-line-number="1"]').length) {
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
