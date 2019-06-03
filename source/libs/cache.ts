interface CacheItem {
	data: unknown;
	expiration: number;
}

const storage: browser.storage.StorageArea = browser.storage.local;

export async function has(key: string): Promise<boolean> {
	const values = await storage.get(key);
	return values[key] !== undefined;
}

export async function get<TValue extends any = any>(key: string): Promise<TValue | undefined> {
	const cachedKey = `cache:${key}`;
	const values = await storage.get(cachedKey);
	const value = values[cachedKey];
	// If it's not in the cache, it's best to return "undefined"
	if (value === undefined) {
		return undefined;
	}

	if (value.expiration > Date.now()) {
		await storage.remove(cachedKey);
		return undefined;
	}

	console.log('CACHE: found', key, value.data);
	return value.data;
}

export function set<TValue extends any = any>(key: string, value: TValue, expiration: number /* in days */): Promise<any> {
	console.log('CACHE: setting', key, value);
	const cachedKey = `cache:${key}`;
	return storage.set({
		[cachedKey]: {
			data: value,
			expiration: Date.now() + (1000 * 3600 * 24 * expiration)
		}
	});
}

async function purge(): Promise<void> {
	const values = await storage.get() as {[key: string]: CacheItem};
	const removableItems = [];
	for (const [key, value] of Object.entries(values)) {
		if (!key.startsWith('cache:')) {
			// Item not created by the cache, skip
			continue;
		}

		if (value.expiration > Date.now()) {
			removableItems.push(key);
		}
	}

	if (removableItems.length > 0) {
		await storage.remove(removableItems);
	}
}

// Automatically clear cache every day
if (location.pathname === '/_generated_background_page.html') {
	// Call immediately to ensure the cache gets purged at some point.
	purge();
	setInterval(purge, 1000 * 3600 * 24);
}
