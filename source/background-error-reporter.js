// Build not available in this file, don't import anything and don't convert to TS

globalThis.addEventListener('error', event => {
	chrome.storage.session.set({backgroundLoadError: event.message + '\n' + event.error?.stack});
	// reportError(event.error ?? new Error(event.message));
	// stop error:
	event.preventDefault();
}, {
	once: true,
	// Only catch load errors
	signal: AbortSignal.timeout(100)
});
