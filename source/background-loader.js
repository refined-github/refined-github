const backgroundPageLoadErrorsKey = 'backgroundPageLoadErrors';
const storage = chrome.storage.session ?? chrome.storage.local;

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
	const storedErrors = await storage.get(backgroundPageLoadErrorsKey);
	const errors = storedErrors[backgroundPageLoadErrorsKey] ?? [];

	if (errors.some(storedError => storedError.message === serialized.message && storedError.stack === serialized.stack)) {
		return;
	}

	await storage.set({
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

await storage.remove(backgroundPageLoadErrorsKey);

try {
	// eslint-disable-next-line import-x/extensions -- The loader is copied to `distribution/assets`, where the built file is `background.js`.
	await import('./background.js');
} catch (error) {
	await storeBackgroundPageLoadError(error);
	throw error;
}
