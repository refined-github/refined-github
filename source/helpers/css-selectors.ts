export function is(selectors: readonly string[]): string;
export function is(firstSelector: string, ...otherSelectors: readonly string[]): string;
export function is(firstSelector: readonly string[] | string, ...otherSelectors: readonly string[]): string {
	const selectors = Array.isArray(firstSelector) ? firstSelector : [firstSelector, ...otherSelectors];
	return `:is(${selectors.join(', ')})`;
}

export function not(selectors: readonly string[]): string;
export function not(firstSelector: string, ...otherSelectors: readonly string[]): string;
export function not(firstSelector: readonly string[] | string, ...otherSelectors: readonly string[]): string {
	const selectors = Array.isArray(firstSelector) ? firstSelector : [firstSelector, ...otherSelectors];
	return `:not(${selectors.join(', ')})`;
}
