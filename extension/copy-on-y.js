/* globals utils */

'use strict';

const Y_KEYCODE = 89;

window.enableCopyOnY = (() => {
	const handler = ({keyCode, target}) => {
		if (keyCode === Y_KEYCODE && target.nodeName !== 'INPUT') {
			const commitIsh = utils.select('.commit-tease-sha').textContent.trim();
			const uri = location.href.replace(/\/blob\/[\w-]+\//, `/blob/${commitIsh}/`);

			utils.copyToClipboard(uri);
		}
	};

	return {
		setup: () => {
			window.addEventListener('keyup', handler);
		},
		destroy: () => {
			window.removeEventListener('keyup', handler);
		}
	};
})();
