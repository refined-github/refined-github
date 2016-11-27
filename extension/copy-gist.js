/* globals utils */

'use strict';

window.addGistCopyButton = () => {
	// Button already added (partial page nav), or non-text file
	if ($('.copy-btn').length > 0) {
		return;
	}	
	
	const $gistsSibling = $('div.file-actions>a.btn.btn-sm');
	for (var i = 0; i < $gistsSibling.length; i++) {
		const gistUri = $gistsSibling[i].href;
		$(`<a href="${gistUri}" class="btn btn-sm copy-btn">Copy</a>`).insertBefore($gistsSibling[i]);
	}

	$(document).on('click', '.copy-btn', e => {
		e.preventDefault();
		const fileContents = $('.js-file-line-container').get(0).innerText;
		utils.copyToClipboard(fileContents);
	});

};
