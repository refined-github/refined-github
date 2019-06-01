type CacheGetter<TValue extends any = any> = () => TValue | Promise<TValue>;

interface CacheRequest {
	code: string;
	key: string;
	value?: unknown;
	expiration?: number;
}

export async function getSet<TValue extends any = any>(key: string, getter: CacheGetter<TValue>, expiration?: number): Promise<TValue | undefined> {
	const cache = await get<TValue>(key);
	if (cache !== undefined) {
		return cache;
	}

	const value = await getter();
	if (value !== undefined) {
		await set(key, value, expiration);
	}

	return value;
}

export async function get<TValue extends any = any>(key: string): Promise<TValue | undefined> {
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

export function set<TValue extends any = any>(key: string, value: TValue, expiration?: number /* in days */): Promise<any> {
	return browser.runtime.sendMessage({
		key,
		value,
		expiration,
		code: 'set-cache'
	});
}

const storage: browser.storage.StorageArea | undefined = browser.storage.local;

export function purge(): void {

}

/* Accept messages in background page */
if (location.pathname === '/_generated_background_page.html') {
	browser.runtime.onMessage.addListener(async (request: CacheRequest) => {
		if (!request) {
			return;
		}

		const {code, key, value, expiration} = request;
		if (code === 'get-cache') {
			if (storage) {
				const values = await storage.get(key);
				let value = values[key];
				if (value) {
					value = JSON.parse(value);
					console.log('CACHE: found', key, value.data);
					return value.data;
				}
			}

			// Fallback to cookie based cache
			const [cached] = document.cookie.split('; ')
				.filter(item => item.startsWith(key + '='));
			if (cached) {
				const [, value] = cached.split('=');
				console.log('CACHE: found', key, value);
				return JSON.parse(value);
			}

			console.log('CACHE: not found', key);
		} else if (code === 'set-cache') {
			console.log('CACHE: setting', key, value);

			// Store as JSON to preserve data type
			// otherwise Booleans and Numbers become strings
			if (storage) {
				storage.set({
					[key]: JSON.stringify({
						data: value,
						lastUse: Date.now(),
						expiration: Date.now() + (1000 * 3600 * 24)
					})
				});
			} else {
				document.cookie = `${key}=${JSON.stringify(value)}; max-age=${expiration ? expiration * 3600 * 24 : ''}`;
			}
		}
	});
}
