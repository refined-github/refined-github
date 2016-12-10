/* globals utils */

'use strict';

window.addGistCopyButton = () => {
	// Button already added (partial page nav), or non-text file
	if ($('.copy-btn').length > 0) {
		return;
	}
	const $gistsSibling = $('.file-actions > .btn.btn-sm');

	for (let i = 0; i < $gistsSibling.length; i++) {
		const commonContainer = $('.file')[i];
		const isSourceCodeClass = commonContainer.children[1].classList.contains('blob-wrapper');
		const gistUri = $gistsSibling[i].href;
		if (isSourceCodeClass) {
			$(`<a href="${gistUri}" class="btn btn-sm copy-btn">Copy</a>`).insertBefore($gistsSibling[i]);
		}
	}

	$(document).on('click', '.copy-btn', e => {
		e.preventDefault();
		const fileContents = $(`#${e.currentTarget.offsetParent.id}`).find('.js-file-line-container')[0].innerText;
		utils.copyToClipboard(fileContents);
	});
};
