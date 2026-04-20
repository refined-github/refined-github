export function is(...selectors: readonly string[]): string {
	return `:is(${selectors.join(', ')})`;
}

export function not(...selectors: readonly string[]): string {
	return `:not(${selectors.join(', ')})`;
}
