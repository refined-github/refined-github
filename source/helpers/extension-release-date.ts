import {isSafari} from 'webext-detect';

import isDevelopmentVersion from './is-development-version.js';

// Safari updates are less frequent
const maxReleaseAgeInDays = isSafari() ? 60 : 30;

/** Converts a calver extension version into the date it was released: `25.3.10` is 2025-03-10 and `25.3` is 2025-03-01 */
export function versionToDate(version: string): Date {
	const [year, month, day = 1] = version.split('.').map(Number);
	// Date constructor uses 0-based months
	return new Date(2000 + year, month - 1, day);
}

export function getExtensionReleaseDate(): Date {
	if (isDevelopmentVersion()) {
		// Pretend it was released recently
		return new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));
	}

	return versionToDate(chrome.runtime.getManifest().version);
}

export function wasReleasedLongAgo(releaseAgeInDays: number): boolean {
	return releaseAgeInDays > maxReleaseAgeInDays;
}

export function toDaysAgo(releaseDate: Date): number {
	return Math.floor((Date.now() - releaseDate.getTime()) / (1000 * 60 * 60 * 24));
}
