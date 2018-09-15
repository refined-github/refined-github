export function get(key) {
	return browser.runtime.sendMessage({
		key,
		code: 'get-cache'
	});
}

export function set(key, value, expiration /* in days */) {
	return browser.runtime.sendMessage({
		key,
		value,
		expiration,
		code: 'set-cache'
	});
}

/* Accept messages in background page */
if (!browser.runtime.getBackground) {
	browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
		if (!request) {
			return;
		}
		const {code, key, value, expiration} = request;
		if (code === 'get-cache') {
			const [cached] = document.cookie.split('; ')
				.filter(item => item.startsWith(key + '='));

			if (cached) {
				const [, value] = cached.split('=');
				sendResponse(value);
			} else {
				sendResponse(undefined);
			}
		} else if (code === 'set-cache') {
			document.cookie = `${key}=${value}; max-age=${expiration ? expiration * 3600 * 24 : ''}`;
		}
	});
}
