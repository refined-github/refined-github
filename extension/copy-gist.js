/* globals utils */

'use strict';

window.addGistCopyButton = () => {
	// Button already added (partial page nav), or non-text file
	if ($('.copy-btn').length > 0) {
		return;
	}
	const $gistsSibling = $('.file-actions > .btn.btn-sm');

	for (let i = 0; i < $gistsSibling.length; i++) {
		let sourceCodeClass = $(`#${$gistsSibling[i].offsetParent.id}>div`).eq(1)[0].className;
		const gistUri = $gistsSibling[i].href;
		if (sourceCodeClass.indexOf('blob-wrapper') != -1) {
			$(`<a href="${gistUri}" class="btn btn-sm copy-btn">Copy</a>`).insertBefore($gistsSibling[i]);
		}
	}

	$(document).on('click', '.copy-btn', e => {
		e.preventDefault();
		const fileContents = $(`#${e.currentTarget.offsetParent.id}`).find('.js-file-line-container')[0].innerText;
		utils.copyToClipboard(fileContents);
	});
};
