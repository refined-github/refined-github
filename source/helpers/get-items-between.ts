/**
Get the items between previous and current, both ends included. If `previous` is missing, start from 0
*/
export default function getItemsBetween<T>(items: T[], previous: T | undefined, current: T): T[] {
	const selections = [
		previous ? items.indexOf(previous) : 0,
		items.indexOf(current),
	].sort((a, b) => a - b);

	selections[1] += 1;

	return items.slice(...selections);
}
