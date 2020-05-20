export default function pluralize(count: number, single: string, plural: string, zero?: string): string {
	if (count === 0 && zero) {
		return zero.replace('$$', '0');
	}

	if (count === 1) {
		return single.replace('$$', '1');
	}

	return plural.replace('$$', String(count));
}
