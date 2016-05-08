(exports => {
	'use strict';

	exports.debounce = (func, wait, immediate) => {
		let timeout;
		return function (...args) {
			const later = () => {
				timeout = null;
				if (!immediate) {
					func.apply(this, args);
				}
			};
			const callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) {
				func.apply(this, args);
			}
		};
	};

	exports.copyToClipboard = value => {
		const $textArea = $('<textarea>').css({
			opacity: 0,
			position: 'fixed'
		}).appendTo('body').val(value);

		$textArea.get(0).select();
		const success = document.execCommand('copy');
		$textArea.remove();

		return success;
	};
})(window.utils = {});
