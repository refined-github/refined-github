const backgroundPageLoadErrorsKey = 'backgroundPageLoadErrors';
const storage = chrome.storage.session ?? chrome.storage.local;

async function storageGet(key) {
	return new Promise((resolve, reject) => {
		storage.get(key, result => {
			if (chrome.runtime.lastError) {
				reject(new Error(chrome.runtime.lastError.message));
			} else {
				resolve(result);
			}
		});
	});
}

async function storageRemove(key) {
	return new Promise((resolve, reject) => {
		storage.remove(key, () => {
			if (chrome.runtime.lastError) {
				reject(new Error(chrome.runtime.lastError.message));
			} else {
				resolve();
			}
		});
	});
}

async function storageSet(value) {
	return new Promise((resolve, reject) => {
		storage.set(value, () => {
			if (chrome.runtime.lastError) {
				reject(new Error(chrome.runtime.lastError.message));
			} else {
				resolve();
			}
		});
	});
}

function serializeError(error) {
	const serialized = {
		message: error instanceof Error ? error.message : String(error),
	};

	if (error instanceof Error && error.stack) {
		serialized.stack = error.stack;
	}

	return serialized;
}

async function storeBackgroundPageLoadError(error) {
	const serialized = serializeError(error);
	const storedErrors = await storageGet(backgroundPageLoadErrorsKey);
	const errors = storedErrors[backgroundPageLoadErrorsKey] ?? [];

	if (errors.some(storedError => storedError.message === serialized.message && storedError.stack === serialized.stack)) {
		return;
	}

	await storageSet({
		[backgroundPageLoadErrorsKey]: [
			...errors,
			serialized,
		],
	});
}

function backgroundPageLoadErrorListener(event) {
	storeBackgroundPageLoadError(event.error ?? event.message);
}

globalThis.addEventListener('error', backgroundPageLoadErrorListener);
Object.defineProperty(globalThis, 'removeBackgroundPageLoadErrorListener', {
	configurable: true,
	value() {
		globalThis.removeEventListener('error', backgroundPageLoadErrorListener);
	},
});

await storageRemove(backgroundPageLoadErrorsKey);

try {
	// eslint-disable-next-line import-x/extensions -- The loader is copied to `distribution/assets`, where the built file is `background.js`.
	await import('./background.js');
} catch (error) {
	await storeBackgroundPageLoadError(error);
	throw error;
}
