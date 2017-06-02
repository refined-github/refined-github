export const debounce = (func, wait, immediate) => {
	let timeout;
	return function (...args) {
		const later = () => {
			timeout = null;
			if (!immediate) {
				func.apply(this, args);
			}
		};
		const callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) {
			func.apply(this, args);
		}
	};
};

export const issueRegex = /([a-zA-Z0-9-_.]+\/[a-zA-Z0-9-_.]+)?#[0-9]+/;
export const linkifyIssueRef = (repoPath, issue, attrs) => {
	if (/\//.test(issue)) {
		const issueParts = issue.split('#');
		return `<a href="https://github.com/${issueParts[0]}/issues/${issueParts[1]}" ${attrs}>${issue}</a>`;
	}
	return `<a href="https://github.com/${repoPath}/issues/${issue.replace('#', '')}" ${attrs}>${issue}</a>`;
};

export const select = selector => document.querySelector(selector);
export const exists = selector => Boolean(document.querySelector(selector));
