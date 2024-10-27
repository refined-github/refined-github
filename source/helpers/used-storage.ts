/** `getBytesInUse` polyfill */
export default async function getStorageBytesInUse(area: 'local' | 'sync'): Promise<any> {
	const storage = chrome.storage[area];
	try {
		return await storage.getBytesInUse(); // Exists in Safari iOS, but can't be called...
	} catch {
		// Firefox https://bugzilla.mozilla.org/show_bug.cgi?id=1385832#c20
		return new TextEncoder().encode(
			Object.entries(await storage.get())
				.map(([key, value]) => key + JSON.stringify(value))
				.join(''),
		).length;
	}
}

export async function hasUsedStorage(): Promise<boolean> {
	return (
		await getStorageBytesInUse('sync') > 0
		|| Number(await getStorageBytesInUse('local')) > 0
	);
}
