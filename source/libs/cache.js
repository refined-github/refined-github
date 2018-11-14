export async function getSet(key, getter, expiration) {
	const cache = await get(key);
	if (cache !== undefined) {
		return cache;
	}
	const value = await getter();
	if (value !== undefined) {
		await set(key, value, expiration);
		return value;
	}
}

export async function get(key) {
	const value = await browser.runtime.sendMessage({
		key,
		code: 'get-cache'
	});

	// If it's not in the cache, it's best to return "undefined"
	if (value === null || value === undefined) {
		return undefined;
	}
	return value;
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
				sendResponse(JSON.parse(value));
				console.log('CACHE: found', key, value);
			} else {
				sendResponse();
				console.log('CACHE: not found', key);
			}
		} else if (code === 'set-cache') {
			console.log('CACHE: setting', key, value);

			// Store as JSON to preserve data type
			// otherwise Booleans and Numbers become strings
			document.cookie = `${key}=${JSON.stringify(value)}; max-age=${expiration ? expiration * 3600 * 24 : ''}`;
		}
	});
}
