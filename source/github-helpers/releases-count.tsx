import {CachedFunction} from 'webext-storage-cache';

import {cacheByRepo, getRepo} from '.';
import api from './api.js';
import GetReleasesCount from './releases-count.gql';

async function fetchCounts(nameWithOwner: string): Promise<[0] | [number, 'Tags' | 'Releases']> {
	const [owner, name] = nameWithOwner.split('/');
	const {repository: {releases, tags}} = await api.v4(GetReleasesCount, {
		variables: {name, owner},
	});

	if (releases.totalCount) {
		return [releases.totalCount, 'Releases'];
	}

	if (tags.totalCount) {
		return [tags.totalCount, 'Tags'];
	}

	return [0];
}

const releasesCount = new CachedFunction('releases-count', {
	updater: fetchCounts,
	shouldRevalidate: cachedValue => typeof cachedValue === 'number',
	maxAge: {hours: 1},
	staleWhileRevalidate: {days: 3},
	cacheKey: cacheByRepo,
});


export default async function getReleasesCount(): Promise<[0] | [number, 'Tags' | 'Releases']> {
	const repo = getRepo()!.nameWithOwner;
	return releasesCount.get(repo);
}
