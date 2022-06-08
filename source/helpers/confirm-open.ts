export default function confirmOpen(count: number): boolean {
	return count < 10 || confirm(`This will open ${count} new tabs. Continue?`);
}
