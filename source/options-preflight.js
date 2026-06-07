function appendError(error) {
	const paragraph = document.createElement('p');
	paragraph.textContent = error;
	document.body.append(paragraph);
}

globalThis.addEventListener('error', event => {
	appendError(event.error ?? event.message);
});

globalThis.addEventListener('unhandledrejection', event => {
	appendError(event.reason);
});
