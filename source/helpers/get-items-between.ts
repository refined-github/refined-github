/**
Get the items between previous and current, both ends included. If `previous` is missing, start from 0
*/
export default function getItemsBetween<T>(items: T[], previous: T | undefined, current: T): T[] {
	const start = previous ? items.indexOf(previous) : 0;
	const end = items.indexOf(current);

	return items.slice(Math.min(start, end), Math.max(start, end) + 1);
}
