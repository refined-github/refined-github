import {isSafari} from 'webext-detect';

import isDevelopmentVersion from './is-development-version.js';

const {version} = chrome.runtime.getManifest();

/** Returns the version age in days if it exceeds the browser-specific threshold, or `undefined` otherwise. */
export default function getOutdatedVersionAge(): number | undefined {
	if (isDevelopmentVersion()) {
		return;
	}

	// Version format: YY.M.D (e.g., 25.3.10 = 2025-03-10)
	const [year, month, day] = version.split('.').map(Number);
	const releaseDate = new Date(2000 + year, month - 1, day);
	const ageInDays = (Date.now() - releaseDate.getTime()) / (1000 * 60 * 60 * 24);

	// Safari updates are less frequent: tolerate up to 50 days
	const maxAge = isSafari() ? 50 : 20;
	return ageInDays > maxAge ? ageInDays : undefined;
}
