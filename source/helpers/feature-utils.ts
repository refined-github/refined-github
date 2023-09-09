import {isMobileSafari} from 'webext-detect-page';
import {Promisable} from 'type-fest';

import {pEveryFunction, pSomeFunction} from './p-utils.js';

export type BooleanFunction = () => boolean;
export type PromisableBooleanFunction = () => Promisable<boolean>;

export function isFeaturePrivate(id: string): boolean {
	return id.startsWith('rgh-');
}

export const doesBrowserActionOpenOptions = isMobileSafari();

export async function shouldFeatureRun({
	/** Every condition must be true */
	asLongAs = [() => true],
	/** At least one condition must be true */
	include = [() => true] as PromisableBooleanFunction[],
	/** No conditions must be true */
	exclude = [() => false],
}): Promise<boolean> {
	return await pEveryFunction(asLongAs, c => c())
		&& await pSomeFunction(include, c => c())
		&& pEveryFunction(exclude, c => !c());
}
