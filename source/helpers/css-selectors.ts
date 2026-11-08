import type {Join} from 'type-fest';

export function is<const Selectors extends readonly string[]>(selectors: Selectors): `:is(${Join<Selectors, ', '>})`;
export function is<const Selectors extends readonly string[]>(...selectors: Selectors): `:is(${Join<Selectors, ', '>})`;
export function is(...selectors: readonly string[] | [readonly string[]]): string {
	return `:is(${selectors.flat().join(', ')})`;
}

export function not<const Selectors extends readonly string[]>(selectors: Selectors): `:not(${Join<Selectors, ', '>})`;
export function not<const Selectors extends readonly string[]>(...selectors: Selectors): `:not(${Join<Selectors, ', '>})`;
export function not(...selectors: readonly string[] | [readonly string[]]): string {
	return `:not(${selectors.flat().join(', ')})`;
}

export function has<const Selectors extends readonly string[]>(selectors: Selectors): `:has(${Join<Selectors, ', '>})`;
export function has<const Selectors extends readonly string[]>(...selectors: Selectors): `:has(${Join<Selectors, ', '>})`;
export function has(...selectors: readonly string[] | [readonly string[]]): string {
	return `:has(${selectors.flat().join(', ')})`;
}
