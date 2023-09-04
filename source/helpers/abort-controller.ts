export function callHandle(handle: Deinit): void {
	if ('disconnect' in handle) { // Browser observers
		handle.disconnect();
	} else if ('abort' in handle) {
		handle.abort();
	} else if (typeof handle === 'function') {
		handle();
	}
}

export default function onAbort(abort: AbortController | AbortSignal, ...callbacks: Deinit[]): void {
	const signal = abort instanceof AbortController ? abort.signal : abort;
	signal.addEventListener('abort', () => {
		for (const callback of callbacks) {
			callHandle(callback);
		}
	});
}
