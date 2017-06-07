import {getRepoURL} from './page-detect';

export const shortenUrl = plainUrl => {
	let {
		origin,
		pathname,
		search,
		hash
	} = new URL(plainUrl);

	let [
		, // Always empty
		user,
		repo,
		type,
		revision,
		...filePath
	] = pathname.split('/');

	const isLocalUrl = origin === location.origin;
	const isCurrentRepo = isLocalUrl && getRepoURL() === `${user}/${repo}`;

	const isRaw = [
		'https://raw.githubusercontent.com',
		'https://cdn.rawgit.com',
		'https://rawgit.com'
	].includes(origin);

	const isFile = [
		'blob',
		'blame'
	].includes(type);

	// Drop origin if pathname makes sense on its own
	if ((isRaw || isLocalUrl) && pathname.split('/').length > 3) {
		origin = '';
	} else {
		// Otherwise just drop HTTPS
		origin = origin.replace('https://', '');
	}

	// Shorten GitHub file URLs
	if (isFile || isRaw) {
		let newPath = '';

		// Drop 'user/repo' where possible
		if (!isCurrentRepo) {
			newPath += `/${user}/${repo}`;
		}

		// Shift variables on "raw" urls because they don't have a type
		if (isRaw) {
			filePath.unshift(revision);
			revision = type;
		} else if (type !== 'blob') {
			// Highlight 'type'; drop it if it's 'blob'
			newPath += `/<em>${type}</em>`;
		}

		if (revision) {
			// Shorten hashes
			if (/^[0-9a-f]{40}$/.test(revision)) {
				revision = revision.substr(0, 7);
			}
			// Highlight hashes and branches
			newPath += `/<code>${revision}</code>`;
		}

		if (filePath.length > 0) {
			filePath = filePath.join('/');
			if (isRaw) {
				filePath = `<code>${filePath}</code>`;
			}
			newPath += `:${filePath}`;
		}

		pathname = newPath;
	}

	// Join all; drop possible starting backslash
	return `${origin}${pathname}${search}${hash}`.replace(/^[/]/, '');
};

export const issueRegex = /([a-zA-Z0-9-_.]+\/[a-zA-Z0-9-_.]+)?#[0-9]+/;
export const linkifyIssueRef = (repoPath, issue, attrs) => {
	if (/\//.test(issue)) {
		const issueParts = issue.split('#');
		return `<a href="/${issueParts[0]}/issues/${issueParts[1]}" ${attrs}>${issue}</a>`;
	}
	return `<a href="/${repoPath}/issues/${issue.replace('#', '')}" ${attrs}>${issue}</a>`;
};

