/* global chrome */

const events = [
	['request', 'onAdded'],
	['remove', 'onRemoved']
] as const;

if (chrome.permissions && !chrome.permissions.onAdded) {
	for (const [action, event] of events) {
		const act = chrome.permissions[action];

		// Collect
		chrome.permissions[event] = {
			addListener(callback) {
				document.addEventListener('lol:' + action, ((event: CustomEvent<{permissions: chrome.permissions.Permissions}>) => {
					console.log('got event', event)
					callback(event.detail.permissions)
				}) as EventListener)
			}
		};

		// Listen into requests and fire callbacks
		chrome.permissions[action] = (permissions, callback) => {
			console.log('will you', action, permissions)
			act(permissions, successful => {
				console.log(successful)
				if (callback) {
					callback(successful);
				}

				if (successful) {
					document.dispatchEvent(new CustomEvent('lol:'+ action, {detail: {permissions}}));
				}
			});
		};
	}
}
