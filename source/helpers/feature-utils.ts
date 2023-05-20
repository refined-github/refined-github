import {isMobileSafari} from 'webext-detect-page';

export function isFeaturePrivate(id: string): boolean {
	return id.startsWith('rgh-');
}

export const doesBrowserActionOpenOptions = isMobileSafari();
