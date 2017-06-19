const callbacks = new Set();
const observer = new MutationObserver(records => {
	for (const cb of callbacks) {
		cb(records, observer);
	}
});

export default {
	on(cb) {
		if (typeof cb !== 'function') {
			throw new TypeError('cb must be a function');
		}
		if (callbacks.size === 0) {
			observer.observe(document.querySelector('#dashboard .news'), {
				childList: true
			});
		}
		callbacks.add(cb);
	},
	off(cb) {
		if (typeof cb !== 'function') {
			throw new TypeError('cb must be a function');
		}
		callbacks.delete(cb);
		if (callbacks.size === 0) {
			observer.disconnect();
		}
	}
};
