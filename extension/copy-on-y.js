/* globals utils */

'use strict';

const Y_KEYCODE = 89;

window.enableCopyOnY = () => {
	$(document).on('keyup', ({keyCode}) => {
		if (keyCode === Y_KEYCODE) {
			const commitIsh = $('.commit-tease-sha').text().trim();
			const uri = location.href.replace(/\/blob\/[\w-]+\//, `/blob/${commitIsh}/`);

			utils.copyToClipboard(uri);
		}
	});
};
