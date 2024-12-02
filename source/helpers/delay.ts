export default async function delay(ms: number, signal?: AbortSignal): Promise<void> {
	signal?.throwIfAborted();
	await new Promise<void>((resolve, reject) => {
		const timeout = setTimeout(resolve, ms);
		signal?.addEventListener('abort', () => {
			clearTimeout(timeout);
			reject(signal.reason);
		});
	});
}
