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
				console.log('setting listener for', action, callback.toString());

				window.addEventListener('message', event => {
					console.log('got message!', event.data, action)
					if (event.data && event.data.action === action) {
						console.log('got permissions', event.data.permissions)
						callback(event.data.permissions)
						console.log('called callback')
					}
				});
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
					console.log(location.href)
					window.postMessage({action, permissions}, '*');
				}
			});
		};
	}
}
