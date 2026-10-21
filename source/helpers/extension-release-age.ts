import {isSafari} from 'webext-detect';

import isDevelopmentVersion from './is-development-version.js';
import versionToDate from './version-to-date.js';

const {version} = chrome.runtime.getManifest();

// Safari updates are less frequent
const maxReleaseAgeInDays = isSafari() ? 60 : 30;

export function wasReleasedLongAgo(releaseAgeInDays: number): boolean {
	return releaseAgeInDays > maxReleaseAgeInDays;
}

export function getExtensionReleaseDate(): Date {
	if (isDevelopmentVersion()) {
		// Pretend it was released recently
		return new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));
	}

	return versionToDate(version);
}

export function toDaysAgo(releaseDate: Date): number {
	return Math.floor((Date.now() - releaseDate.getTime()) / (1000 * 60 * 60 * 24));
}
