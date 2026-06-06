function appendError(error) {
	const message = typeof error === 'string' ? error : String(error);
	const paragraph = document.createElement('p');
	paragraph.textContent = message;
	document.body.append(paragraph);
}

addEventListener('error', event => {
	appendError(event.error?.message ?? event.message);
});

addEventListener('unhandledrejection', event => {
	appendError(event.reason?.message ?? event.reason);
});
