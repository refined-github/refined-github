/** Loop an iterable with the ability to place a non-blocking `await` in the loop itself */
export default async function asyncForEach<Item>(
	iterable: Iterable<Item>,
	iteratee: (item: Item) => Promise<void>,
	// If omitted, errors are rethrown
	onError?: (error: unknown) => void,
): Promise<void> {
	await Promise.all([...iterable].map(async item => {
		try {
			await iteratee(item);
		} catch (error) {
			if (!onError) {
				throw error;
			}

			onError(error);
		}
	}));
}
