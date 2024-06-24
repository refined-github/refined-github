/** `getBytesInUse` polyfill */
export default async function getStorageBytesInUse(area: 'local' | 'sync'): Promise<any> {
	const storage = chrome.storage[area];
	return 'getBytesInUse' in storage
		? storage.getBytesInUse() // Good browsers
		: new TextEncoder().encode( // Firefox
			// @ts-expect-error https://bugzilla.mozilla.org/show_bug.cgi?id=1385832#c20
			Object.entries(await storage.get())
				.map(([key, value]) => key + JSON.stringify(value))
				.join(''),
		).length;
}
