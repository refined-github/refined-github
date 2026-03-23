import {isSafari} from 'webext-detect';

import isDevelopmentVersion from './is-development-version.js';

const {version} = chrome.runtime.getManifest();

// Safari updates are less frequent
const maxReleaseAgeInDays = isSafari() ? 50 : 20;

export function wasReleasedLongAgo(releaseAgeInDays: number): boolean {
	return releaseAgeInDays > maxReleaseAgeInDays;
}

export function getExtensionReleaseDate(): Date {
	if (isDevelopmentVersion()) {
		return new Date();
	}

	const [year, month, day] = version.split('.').map(Number);
	// Version format: YY.M.D (e.g., 25.3.10 = 2025-03-10)
	// Date constructor uses 0-based months
	return new Date(2000 + year, month - 1, day);
}

export function toDaysAgo(releaseDate: Date): number {
	return Math.floor((Date.now() - releaseDate.getTime()) / (1000 * 60 * 60 * 24));
}
