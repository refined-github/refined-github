window.utils = {
	debounce(func, wait, immediate) {
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
	}
};
