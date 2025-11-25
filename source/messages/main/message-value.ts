import type {RghMessageValue} from './message-manager';

/**
 * Special symbol to filter out values that cannot be cannot be converted to transferable values
 */
export const untransferable = Symbol('untransferable');
export type Untransferable = typeof untransferable;

export type RghMessageValueReplacer = (key: string | number | undefined, value: unknown) => RghMessageValue;

/**
 * Converts a value to a message value transferable between worlds, filtering out non-transferable values.
 * @param value - The value to convert
 * @param replacer - Function to handle non-transferable values (functions, class instances, etc.)
 * @returns The converted value, or `undefined` if the value wasn't converted
 */
export function toRghMessageValue(value: unknown, replacer?: RghMessageValueReplacer): RghMessageValue {
	const result = convertValue(undefined, value, replacer);
	return result === untransferable ? undefined : result;
}

function convertValue(key: string | number | undefined, value: unknown, replacer?: RghMessageValueReplacer): RghMessageValue | Untransferable {
	if (value === null || value === undefined) {
		return value;
	}

	switch (typeof value) {
		case 'number':
		case 'bigint':
		case 'string':
		case 'boolean': {
			return value;
		}

		case 'function': {
			return replacer ? replacer(key, value) : untransferable;
		}

		default: {
			// Check for non-plain objects (classes, Date, RegExp, Map, Set, etc.)
			const prototype = Object.getPrototypeOf(value);
			if (prototype !== null && prototype !== Object.prototype && prototype !== Array.prototype) {
				return replacer ? replacer(key, value) : untransferable;
			}

			if (Array.isArray(value)) {
				return value.map((item, index) => convertValue(index, item, replacer)).filter(item => item !== untransferable);
			}

			return Object.fromEntries(
				Object.entries(value)
					.map(([entryKey, nestedValue]) => [entryKey, convertValue(entryKey, nestedValue, replacer)])
					.filter(entry => entry[1] !== untransferable),
			);
		}
	}
}
