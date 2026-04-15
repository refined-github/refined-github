export default async function delay(ms: number, signal?: AbortSignal): Promise<void> {
	// eslint-disable-next-line no-restricted-syntax -- signal is an optional AbortSignal parameter
	signal?.throwIfAborted();
	await new Promise<void>((resolve, reject) => {
		const timeout = setTimeout(resolve, ms);
		// eslint-disable-next-line no-restricted-syntax -- signal is an optional AbortSignal parameter
		signal?.addEventListener('abort', () => {
			clearTimeout(timeout);
			// eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- Pass as is
			reject(signal.reason);
		});
	});
}
