const storage: browser.storage.StorageArea = browser.storage.local;

export async function has<TValue extends any = any>(key: string): Promise<boolean> {
	const values = await storage.get(key);
	return values[key] !== undefined;
}

export async function get<TValue extends any = any>(key: string): Promise<TValue | undefined> {
	const values = await storage.get(key);
	let value = values[key];
	// If it's not in the cache, it's best to return "undefined"
	if (value === null || value === undefined) {
		return undefined;
	}
	console.log('CACHE: found', key, value.data);
	return value.data;
}

export function set<TValue extends any = any>(key: string, value: TValue, expiration?: number /* in days */): Promise<any> {
	console.log('CACHE: setting', key, value);
	return storage.set({
		[key]: {
			data: value,
			lastUse: Date.now(),
			expiration: expiration ? Date.now() + (1000 * 3600 * 24 * expiration) : -1
		}
	});
}

export function purge(): void {

}
