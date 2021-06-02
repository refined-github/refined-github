import delay from 'delay';

export default async function waitFor(condition: () => any): Promise<void> {
	while (!condition()) {
		// eslint-disable-next-line no-await-in-loop
		await delay(10);
	}
}
