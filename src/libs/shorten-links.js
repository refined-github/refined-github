import select from 'select-dom';
import {getRepoURL} from './page-detect';

const patchDiffRegex = /[.](patch|diff)$/;
const releaseRegex = /releases[/]tag[/]([^/]+)/;
const labelRegex = /labels[/]([^/]+)/;
const releaseArchiveRegex = /archive[/](.+)([.]zip|[.]tar[.]gz)/;
const releaseDownloadRegex = /releases[/]download[/]([^/]+)[/](.+)/;

const reservedPaths = [
	'join',
	'site',
	'blog',
	'about',
	'login',
	'pulls',
	'search',
	'issues',
	'explore',
	'contact',
	'pricing',
	'trending',
	'settings',
	'features',
	'business',
	'personal',
	'security',
	'dashboard',
	'showcases',
	'open-source',
	'marketplace'
];

const styleRevision = revision => {
	if (!revision) {
		return;
	}
	revision = revision.replace(patchDiffRegex, '');
	if (/^[0-9a-f]{40}$/.test(revision)) {
		revision = revision.substr(0, 7);
	}
	return `<code>${revision}</code>`;
};

// Filter out null values
const joinValues = (array, delimiter = '/') => {
	return array.filter(s => s).join(delimiter);
};

export function shortenUrl(href) {
	/**
	 * Parse URL
	 */
	const {
		origin,
		pathname,
		search,
		hash
	} = new URL(href);

	const isRaw = [
		'https://raw.githubusercontent.com',
		'https://cdn.rawgit.com',
		'https://rawgit.com'
	].includes(origin);

	let [
		user,
		repo,
		type,
		revision,
		...filePath
	] = pathname.substr(1).split('/');

	if (isRaw) {
		[
			user,
			repo,
			// Raw URLs don't have `blob` here
			revision,
			...filePath
		] = pathname.substr(1).split('/');
		type = 'raw';
	}

	revision = styleRevision(revision);
	filePath = filePath.join('/');

	const isLocal = origin === location.origin;
	const isThisRepo = (isLocal || isRaw) && getRepoURL() === `${user}/${repo}`;
	const isReserved = reservedPaths.includes(user);
	const [, diffOrPatch] = pathname.match(patchDiffRegex) || [];
	const [, release] = pathname.match(releaseRegex) || [];
	const [, releaseTag, releaseTagExt] = pathname.match(releaseArchiveRegex) || [];
	const [, downloadTag, downloadFilename] = pathname.match(releaseDownloadRegex) || [];
	const [, label] = pathname.match(labelRegex) || [];
	const isFileOrDir = revision && [
		'raw',
		'tree',
		'blob',
		'blame',
		'commits'
	].includes(type);

	const repoUrl = isThisRepo ? '' : `${user}/${repo}`;

	/**
	 * Shorten URL
	 */

	if (isReserved || (!isLocal && !isRaw)) {
		return href
		.replace(/^https:[/][/]/, '')
		.replace(/^www[.]/, '')
		.replace(/[/]$/, '');
	}

	if (user && !repo) {
		return `@${user}${search}${hash}`;
	}

	if (isFileOrDir) {
		const file = `${repoUrl}${filePath ? '/' + filePath : ''}`;
		const revisioned = joinValues([file, revision], '@');
		const partial = `${revisioned}${search}${hash}`;
		if (type !== 'blob' && type !== 'tree') {
			return `${partial} (${type})`;
		}
		return partial;
	}

	if (diffOrPatch) {
		const partial = joinValues([repoUrl, revision], '@');
		return `${partial}.${diffOrPatch}${search}${hash}`;
	}

	if (release) {
		const partial = joinValues([repoUrl, `<code>${release}</code>`], '@');
		return `${partial}${search}${hash} (release)`;
	}

	if (releaseTagExt) {
		const partial = joinValues([repoUrl, `<code>${releaseTag}</code>`], '@');
		return `${partial}${releaseTagExt}${search}${hash}`;
	}

	if (downloadFilename) {
		const partial = joinValues([repoUrl, `<code>${downloadTag}</code>`], '@');
		return `${partial} ${downloadFilename}${search}${hash} (download)`;
	}

	if (label) {
		return joinValues([repoUrl, label]) + `${search}${hash} (label)`;
	}

	// Drop leading and trailing slash of relative path
	return `${pathname.replace(/^[/]|[/]$/g, '')}${search}${hash}`;
}

export default () => {
	for (const a of select.all('a[href]')) {
		// Don't change if it was already customized
		// .href automatically adds a / to naked origins
		// so that needs to be tested too
		if (a.href !== a.textContent && a.href !== `${a.textContent}/`) {
			continue;
		}

		const shortened = shortenUrl(a.href);

		// Don't touch the dom if there's nothing to change
		if (shortened === a.textContent) {
			continue;
		}

		a.innerHTML = shortened;
	}
};
