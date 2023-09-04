/** Loop an iterable with the ability to place a non-blocking `await` in the loop itself */
export default async function asyncForEach<Item>(
	iterable: Iterable<Item>,
	iteratee: (item: Item) => Promise<void>,
): Promise<void> {
	await Promise.all([...iterable].map(async item => iteratee(item)));
}
