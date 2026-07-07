function appendError(error) {
	// eslint-disable-next-line select-dom/prefer -- No build here
	const container = document.querySelector('#js-failed');
	container.append('\n', error);
	container.style.animation = 'none';
}

globalThis.addEventListener('error', event => {
	appendError(event.error ?? event.message);
});

globalThis.addEventListener('unhandledrejection', event => {
	appendError(event.reason);
});
