function regular(single: string): string {
	return single + 's';
}

export default function pluralize(
	count: number,
	single: string,
	plural = regular(single),
	zero?: string,
): string {
	if (count === 0 && zero) {
		return zero.replace('$$', '0');
	}

	if (count === 1) {
		return single.replace('$$', '1');
	}

	return plural.replace('$$', String(count));
}
