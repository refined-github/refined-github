/**
Get the items between previous and current, both ends included. If `previous` is missing, start from 0
*/
export default function getItemsBetween<T>(items: T[], previous: T | undefined, current: T): T[] {
	const selections = [
		items.indexOf(previous) + 1,
		items.indexOf(current) + 1,
	].sort((a, b) => a - b);

	return items.slice(...selections);
}
