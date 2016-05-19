/* globals pageDetect */

'use strict';

const PLUS_EQUAL_KEYCODE = 187;

window.patchDiffShortcuts = () => {
	$(document).on('keyup', e => {
		let commitUrl = location.pathname.replace(/\/$|\.diff$|\.patch$/, '');
		if (pageDetect.isPRCommit()) {
			commitUrl = commitUrl.replace(/\/pull\/\d+\/commits/, '/commit');
		}

		// the plus/equal sign and the shift key and alt key go to original commit url
		// not using the meta key because Chrome uses those keys to zoom
		if (e.which === PLUS_EQUAL_KEYCODE && e.shiftKey && e.altKey) {
			location.href = commitUrl;
			return;
		}

		// the plus/equal sign and the shift key together make +
		if (e.which === PLUS_EQUAL_KEYCODE && e.shiftKey) {
			location.href = `${commitUrl}.patch`;
			return;
		}

		// the plus/equal sign and no shift key is =
		if (e.which === PLUS_EQUAL_KEYCODE && !e.shiftKey) {
			location.href = `${commitUrl}.diff`;
			return;
		}
	});
};
