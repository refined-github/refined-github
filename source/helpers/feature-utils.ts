import {isMobileSafari} from 'webext-detect-page';
import {Promisable} from 'type-fest';

import {pEveryFunction, pSomeFunction} from './p-utils.js';

export type BooleanFunction = () => boolean;
export type PromisableBooleanFunction = () => Promisable<boolean>;

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

export const doesBrowserActionOpenOptions = isMobileSafari();

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
