import {CachedFunction} from 'webext-storage-cache';

export const resolveRedirectUncached = async (url: string): Promise<string> => {
	const response = await fetch(url, {method: 'HEAD', redirect: 'follow'});
	return response.url;
};

const resolveRedirectCached = new CachedFunction('resolve-redirect', {
	updater: resolveRedirectUncached,
	maxAge: {
		days: 7,
	},
});
export const resolveRedirect = resolveRedirectCached.get;
