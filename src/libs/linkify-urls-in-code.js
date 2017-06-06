import select from 'select-dom';
import {escape as escapeHtml} from 'escape-goat';
import {getRepoURL} from './page-detect';
import {getIssueRegex, getURLRegex} from './util';

const linkifiedURLClass = 'refined-github-linkified-code';

export const linkifyURL = (url, label) => `<a href="${escapeHtml(url)}" target="_blank">${escapeHtml(label || url)}</a>`;
export const linkifyIssueRef = issueRef => {
	const [repoPath, issueNumber] = issueRef.split('#');
	return linkifyURL(`/${repoPath || getRepoURL()}/issues/${issueNumber}`, issueRef);
};

export const linkifyURLsInElement = el => {
	el.innerHTML = el.innerHTML.replace(getURLRegex(), match => {
		return linkifyURL(match.replace(/(^&lt)|(&gt$)/, ''));
	});
};

export const linkifyIssuesInElement = el => {
	el.innerHTML = el.innerHTML.replace(getIssueRegex(), linkifyIssueRef);
};

export default () => {
	const untouchedCode = select.all(`.blob-wrapper:not(.${linkifiedURLClass})`);
	// Don't linkify any already linkified code
	if (untouchedCode.length === 0) {
		return;
	}

	// Linkify full URLs
	select.all('.blob-code-inner', untouchedCode).forEach(linkifyURLsInElement);

	// Linkify issue refs in comments
	select.all('.blob-code-inner span.pl-c', untouchedCode).forEach(linkifyIssuesInElement);

	// Mark code block as touched
	untouchedCode.forEach(el => el.classList.add(linkifiedURLClass));
};
