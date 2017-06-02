import {exists, issueRegex, linkifyIssueRef} from './util';

const URLRegex = /(http(s)?(:\/\/))(www\.)?[a-zA-Z0-9-_.]+(\.[a-zA-Z0-9]{2,})([-a-zA-Z0-9:%_+.~#?&//=]*)/g;
const linkifiedURLClass = 'rg-linkified-code';
const commonURLAttrs = `target="_blank" class="${linkifiedURLClass}"`;

const linkifyURL = url => `<a href="${url}" ${commonURLAttrs}>${url}</a>`;

export const hasIssue = text => issueRegex.test(text);
export const findURLs = text => text.match(URLRegex) || [];

export const linkifyCode = repoPath => {
	// Don't linkify any already linkified code
	if (exists(`.${linkifiedURLClass}`)) {
		return;
	}
	const codeBlobs = document.querySelectorAll('.blob-code-inner');
	const commentCodeBlobs = document.querySelectorAll('.blob-code-inner span.pl-c');

	codeBlobs
	.forEach(blob => {
		for (let match of findURLs(blob.innerHTML)) {
			// Remove < or > from beginning or end of an URL
			match = match.replace(/(^&lt)|(&gt$)/, '');
			blob.innerHTML = blob.innerHTML.replace(match, linkifyURL(match));
		}
	});

	commentCodeBlobs
	.forEach(blob => {
		const blobHTML = blob.innerHTML;
		if (hasIssue(blobHTML)) {
			const issueMatch = blobHTML.match(issueRegex)[0];
			blob.innerHTML = blobHTML.replace(issueMatch, linkifyIssueRef(repoPath, issueMatch, commonURLAttrs));
		}
	});
};
