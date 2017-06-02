/* globals utils */

'use strict';

window.addFileCopyButton = () => {
	// Button already added (partial page nav), or non-text file
	if (utils.exists('.copy-btn') || !utils.exists('[data-line-number="1"]')) {
		return;
	}

	const targetSibling = utils.select('#raw-url');
	const fileUri = targetSibling.getAttribute('href');
	$(`<a href="${fileUri}" class="btn btn-sm BtnGroup-item copy-btn">Copy</a>`).insertBefore(targetSibling);

	$(document).on('click', '.copy-btn', e => {
		e.preventDefault();
		const fileContents = utils.select('.js-file-line-container').innerText;
		utils.copyToClipboard(fileContents);
	});
};
