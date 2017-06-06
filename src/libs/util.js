import select from 'select-dom';

export {select};
export const exists = selector => Boolean(select(selector));

export const issueRegex = /([a-zA-Z0-9-_.]+\/[a-zA-Z0-9-_.]+)?#[0-9]+/;
export const linkifyIssueRef = (repoPath, issue, attrs) => {
	if (/\//.test(issue)) {
		const issueParts = issue.split('#');
		return `<a href="/${issueParts[0]}/issues/${issueParts[1]}" ${attrs}>${issue}</a>`;
	}
	return `<a href="/${repoPath}/issues/${issue.replace('#', '')}" ${attrs}>${issue}</a>`;
};

