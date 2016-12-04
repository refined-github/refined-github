/* globals utils */

'use strict';

window.addGistCopyButton = () => {
	// Button already added (partial page nav), or non-text file
	if ($('.copy-btn').length > 0) {
		return;
	}
	const $gistsSibling = $('.file-actions > .btn.btn-sm');

	for (const anchor of $gistsSibling) {
		const gistUri = anchor.href;
		if (gistUri.split('.').pop().toLowerCase() !== 'md') {
			$(`<a href="${gistUri}" class="btn btn-sm copy-btn" id="gists">Copy</a>`).insertBefore(anchor);
		}
	}

	$(document).on('click', '.copy-btn', e => {
		e.preventDefault();
		const fileContents = $(`#${e.currentTarget.offsetParent.id}`).find('.js-file-line-container')[0].innerText;
		utils.copyToClipboard(fileContents);
	});
};
