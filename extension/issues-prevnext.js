/* globals utils */

'use strict';

const PREV_KEYCODE = 37;
const NEXT_KEYCODE = 39;

window.enableIssuesPrevNext = (() => {
	const handler = ({keyCode, target}) => {
		// just go to prev/next issue based on current issue number
		if ((keyCode === PREV_KEYCODE || keyCode === NEXT_KEYCODE) && target.nodeName !== 'INPUT' && target.nodeName !== 'TEXTAREA') {
			const uri = location.href.replace(/\/issues\/(\d+)\/?$/, function(match, current) {
				const offset = (keyCode === PREV_KEYCODE) ? -1 : 1;
				const num = Math.max(1, parseInt(current, 10) + offset);
				return `/issues/${num}`;
			});
			document.location = uri;
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
