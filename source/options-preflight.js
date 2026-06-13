function appendError(error) {
	// eslint-disable-next-line select-dom/prefer -- No build here
	document.querySelector('#js-failed').append('\n', error);
}

addEventListener('error', event => {
	appendError(event.error ?? event.message);
});

addEventListener('unhandledrejection', event => {
	appendError(event.reason);
});
