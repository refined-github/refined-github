function appendError(error) {
	const message = error && String(error);
	if (!message) {
		return;
	}

	const paragraph = globalThis.document.createElement('p');
	paragraph.textContent = message;
	globalThis.document.body.append(paragraph);
}

globalThis.addEventListener('error', event => {
	appendError(event.error ?? event.message);
});

globalThis.addEventListener('unhandledrejection', event => {
	appendError(event.reason);
});
