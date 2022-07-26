export function callHandle(handle: DeinitHandle): void {
	if ('disconnect' in handle) {
		handle.disconnect();
	} else if ('abort' in handle) { // Selector observer
		handle.abort();
	} else	if ('destroy' in handle) { // Delegate subscription
		handle.destroy();
	} else if (typeof handle === 'function') {
		handle();
	}
}

export default function onAbort(abort: AbortController | AbortSignal, ...callbacks: DeinitHandle[]): void {
	const signal = abort instanceof AbortController ? abort.signal : abort;
	signal.addEventListener('abort', () => {
		for (const callback of callbacks) {
			callHandle(callback);
		}
	});
}
