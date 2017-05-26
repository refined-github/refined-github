/* globals utils */

'use strict';

window.addGistCopyButton = () => {
	// Button already added (partial page nav), or non-text file
	if ($('.copy-btn').length > 0) {
		return;
	}

	$('.blob-wrapper').each((i, blob) => {
		const actionsParent = blob.parentNode.querySelector('.file-actions');
		const $btn = $(`<button class="btn btn-sm copy-btn gist-copy-btn">Copy</button>`);
		$btn.data('blob', blob);
		$btn.prependTo(actionsParent);
	});

	$(document).on('click', '.copy-btn', e => {
		e.preventDefault();
		const fileContents = $(e.currentTarget).data('blob').innerText;
		utils.copyToClipboard(fileContents);
	});
};
