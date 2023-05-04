/** `getBytesInUse` polyfill */
export default async function getStorageBytesInUse(area: 'local' | 'sync'): Promise<any> {
	const storage = browser.storage[area];
	// From https://bugzilla.mozilla.org/show_bug.cgi?id=1385832#c20
	return 'getBytesInUse' in storage ? storage.getBytesInUse() : new TextEncoder().encode(
		Object.entries(await storage.get())
			.map(([key, value]) => key + JSON.stringify(value))
			.join(''),
	).length;
}
