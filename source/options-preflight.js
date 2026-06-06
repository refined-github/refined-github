function appendError(error) {
	const message = typeof error === 'string' ? error : String(error);
	const paragraph = globalThis.document.createElement('p');
	paragraph.textContent = message;
	globalThis.document.body.append(paragraph);
}

globalThis.addEventListener('error', event => {
	appendError(event.error?.message ?? event.message);
});

globalThis.addEventListener('unhandledrejection', event => {
	appendError(event.reason?.message ?? event.reason);
});
