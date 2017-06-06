import select from 'select-dom';
import {issueRegex, linkifyIssueRef} from './util';

const URLRegex = /(http(s)?(:\/\/))(www\.)?[a-zA-Z0-9-_.]+(\.[a-zA-Z0-9]{2,})([-a-zA-Z0-9:%_+.~#?&//=]*)/g;
const linkifiedURLClass = 'rg-linkified-code';
const commonURLAttrs = `target="_blank" class="${linkifiedURLClass}"`;

const linkifyURL = url => `<a href="${url}" ${commonURLAttrs}>${url}</a>`;

export const hasIssue = text => issueRegex.test(text);
export const findURLs = text => text.match(URLRegex) || [];

export const linkifyCode = repoPath => {
	// Don't linkify any already linkified code
	if (select.exists(`.${linkifiedURLClass}`)) {
		return;
	}
	const codeBlobs = document.querySelectorAll('.blob-code-inner');
	const commentCodeBlobs = document.querySelectorAll('.blob-code-inner span.pl-c');

	codeBlobs
	.forEach(blob => {
		blob.innerHTML = blob.innerHTML.replace(URLRegex, match => {
			return linkifyURL(match.replace(/(^&lt)|(&gt$)/, ''));
		});
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
