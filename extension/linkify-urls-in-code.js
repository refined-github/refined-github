window.linkifyURLsInCode = (() => {
	const issueRegex = window.utils.issueRegex;
	const URLRegex = /(http(s)?(:\/\/))(www\.)?[a-zA-Z0-9-_.]+(\.[a-zA-Z0-9]{2,})([-a-zA-Z0-9:%_+.~#?&//=]*)/g;
	const linkifiedURLClass = 'rg-linkified-code';
	const commonURLAttrs = `target="_blank" class="${linkifiedURLClass}"`;

	const linkifyURL = url => `<a href="${url}" ${commonURLAttrs}>${url}</a>`;

	const hasIssue = text => issueRegex.test(text);
	const findURLs = text => text.match(URLRegex) || [];

	const linkifyCode = repoPath => {
		// Don't linkify any already linkified code
		if ($(`.${linkifiedURLClass}`).length > 0) {
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
				blob.innerHTML = blobHTML.replace(issueMatch, window.utils.linkifyIssueRef(repoPath, issueMatch, commonURLAttrs));
			}
		});
	};

	return {
		findURLs,
		hasIssue,
		linkifyCode
	};
})();
