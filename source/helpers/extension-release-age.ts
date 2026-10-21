import {isSafari} from 'webext-detect';

// Safari updates are less frequent
const maxReleaseAgeInDays = isSafari() ? 60 : 30;

export function wasReleasedLongAgo(releaseAgeInDays: number): boolean {
	return releaseAgeInDays > maxReleaseAgeInDays;
}

export function toDaysAgo(releaseDate: Date): number {
	return Math.floor((Date.now() - releaseDate.getTime()) / (1000 * 60 * 60 * 24));
}
