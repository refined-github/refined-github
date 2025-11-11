import type {Promisable} from 'type-fest';

import {pEveryFunction, pSomeFunction} from './p-utilities.js';

export type BooleanFunction = () => boolean;
type PromisableBooleanFunction = () => Promisable<boolean>;

export type RunConditions = {
	/** Every condition must be true */
	asLongAs?: PromisableBooleanFunction[];
	/** At least one condition must be true */
	include?: PromisableBooleanFunction[];
	/** No conditions must be true */
	exclude?: PromisableBooleanFunction[];
};

export function isFeaturePrivate(id: string): boolean {
	return id.startsWith('rgh-');
}

// Safari iOS 17.6 has the key, but it does nothing
export const doesBrowserActionOpenOptions = !globalThis.chrome?.contextMenus || navigator.platform === 'iPhone' || navigator.platform === 'iPad';

export async function shouldFeatureRun({
	/** Every condition must be true */
	asLongAs = [() => true],
	/** At least one condition must be true */
	include = [() => true],
	/** No conditions must be true */
	exclude = [() => false],
}: RunConditions): Promise<boolean> {
	return await pEveryFunction(asLongAs, c => c())
		&& await pSomeFunction(include, c => c())
		&& pEveryFunction(exclude, async c => !await c());
}
