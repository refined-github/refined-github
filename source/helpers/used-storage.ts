export function getTrueSizeOfObject(object: Record<string, any>): number {
	// Firefox https://bugzilla.mozilla.org/show_bug.cgi?id=1385832#c20
	return new TextEncoder().encode(
		Object.entries(object)
			.map(([key, value]) => key + JSON.stringify(value))
			.join(''),
	).length;
}

/** `getBytesInUse` polyfill */
export async function getStorageBytesInUse(area: 'local' | 'sync'): Promise<any> {
	const storage = chrome.storage[area];
	try {
		return await storage.getBytesInUse(); // Exists in Safari iOS, but can't be called...
	} catch {
		return getTrueSizeOfObject(await storage.get());
	}
}

export async function getStoredItemSize(area: chrome.storage.AreaName, item: string): Promise<number> {
	const storage = chrome.storage[area];
	return getTrueSizeOfObject(await storage.get(item));
}

export async function hasUsedStorage(): Promise<boolean> {
	return (
		await getStorageBytesInUse('sync') > 0
		|| Number(await getStorageBytesInUse('local')) > 0
	);
}
