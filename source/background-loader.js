function storeBackgroundLoadError(error) {
	localStorage.backgroundLoadErrors ??= '';
	localStorage.backgroundLoadErrors += `${error?.stack ?? error?.message ?? String(error)}\n\n`;
}

function backgroundLoadErrorListener(event) {
	storeBackgroundLoadError(event.error ?? event.message);
}

globalThis.addEventListener('error', backgroundLoadErrorListener);

try {
	// eslint-disable-next-line import-x/extensions -- The loader is copied to `distribution/assets`, where the built file is `background.js`.
	await import('./background.js');
	globalThis.removeEventListener('error', backgroundLoadErrorListener);
} catch (error) {
	storeBackgroundLoadError(error);
	throw error;
}
