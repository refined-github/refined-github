import {getRepoURL} from './page-detect';

export const shortenUrl = url => url
	// Drop HTTPS, but not HTTP
	.replace(/^https:\/\//, '')

	// Drop host if pathname makes sense on its own
	.replace(`${location.host}/`, (host, i, url) => {
		if (i === 0 && url.split('/').length > 3) {
			return '';
		}
		return host;
	})

	// Shorten and highlight commit hashes
	.replace(/([^/]+\/[^/]+)\/blob\/([\da-f]{7,})/i, (m, repo, hash) => {
		return `${repo}/<code>${hash.substr(0, 7)}</code>`;
	})

	// Shorten and highlight branches
	.replace(/([^/]+\/[^/]+)\/(blob|blame)\/([^/]+)/, (m, repo, type, revision) => {
		return `${repo}/${type === 'blob' ? '' : `${type}/`}<code>${revision}</code>`;
	})

	// Shorten and highlight branches
	.replace(`${getRepoURL()}/`, '');

export const issueRegex = /([a-zA-Z0-9-_.]+\/[a-zA-Z0-9-_.]+)?#[0-9]+/;
export const linkifyIssueRef = (repoPath, issue, attrs) => {
	if (/\//.test(issue)) {
		const issueParts = issue.split('#');
		return `<a href="/${issueParts[0]}/issues/${issueParts[1]}" ${attrs}>${issue}</a>`;
	}
	return `<a href="/${repoPath}/issues/${issue.replace('#', '')}" ${attrs}>${issue}</a>`;
};

