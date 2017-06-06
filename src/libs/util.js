export const issueRegex = /([a-zA-Z0-9-_.]+\/[a-zA-Z0-9-_.]+)?#[0-9]+/;
export const linkifyIssueRef = (repoPath, issue, attrs) => {
	if (/\//.test(issue)) {
		const issueParts = issue.split('#');
		return `<a href="/${issueParts[0]}/issues/${issueParts[1]}" ${attrs}>${issue}</a>`;
	}
	return `<a href="/${repoPath}/issues/${issue.replace('#', '')}" ${attrs}>${issue}</a>`;
};

export const select = selector => document.querySelector(selector);
export const exists = selector => Boolean(document.querySelector(selector));
