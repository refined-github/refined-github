function appendError(error) {
	// eslint-disable-next-line select-dom/prefer -- No build here
	document.querySelector('#js-failed').append('\n', error);
}

globalThis.addEventListener('error', event => {
	appendError(event.error ?? event.message);
});

globalThis.addEventListener('unhandledrejection', event => {
	appendError(event.reason);
});
