import delay from 'delay';

export default async function waitFor(booleanFunction: () => any): Promise<void> {
	while (!booleanFunction()) {
		// eslint-disable-next-line no-await-in-loop
		await delay(10);
	}
}
