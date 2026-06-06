function getErrorMessage(error) {
	if (typeof error === 'string') {
		return error;
	}

	if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
		return error.message;
	}

	if (error !== undefined && error !== null) {
		return String(error);
	}

	return undefined;
}

function appendError(error) {
	const message = getErrorMessage(error);
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
