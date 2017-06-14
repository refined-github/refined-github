import {getRepoURL} from './page-detect';

// Filter out null values
const joinValues = (array, delimiter = '/') => {
	return array.filter(s => s).join(delimiter);
};

export const shortenUrl = href => {
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

	if (/^[0-9a-f]{40}$/.test(revision)) {
		revision = revision.substr(0, 7);
	}

	const isLocal = origin === location.origin;
	const isThisRepo = (isLocal || isRaw) && getRepoURL() === `${user}/${repo}`;

	const isReserved = [
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
	].includes(user);

	const isFileOrDir = revision && [
		'raw',
		'tree',
		'blob',
		'blame',
		'commits'
	].includes(type);

	/**
	 * Shorten URL
	 */

	if (isReserved || !repo || (!isLocal && !isRaw)) {
		return href
		.replace(/^https:[/][/]/, '')
		.replace(/^www[.]/, '')
		.replace(/[/]$/, '');
	}

	const repoUrl = isThisRepo ? '' : `${user}/${repo}`;

	if (isFileOrDir) {
		const file = joinValues([repoUrl, ...filePath]);
		const revisioned = joinValues([
			file,
			`<code>${revision}</code>${search}${hash}`
		], '@');
		if (type !== 'blob' && type !== 'tree') {
			return `${revisioned} (${type})`;
		}
		return revisioned;
	}

	return `${pathname.substr(1).replace(/[/]$/, '')}${search}${hash}`;
};

export const issueRegex = /([a-zA-Z0-9-_.]+\/[a-zA-Z0-9-_.]+)?#[0-9]+/;
export const linkifyIssueRef = (repoPath, issue, attrs) => {
	if (/\//.test(issue)) {
		const issueParts = issue.split('#');
		return `<a href="/${issueParts[0]}/issues/${issueParts[1]}" ${attrs}>${issue}</a>`;
	}
	return `<a href="/${repoPath}/issues/${issue.replace('#', '')}" ${attrs}>${issue}</a>`;
};

