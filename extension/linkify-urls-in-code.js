window.linkifyURLsInCode = (() => {
	const issueRegex = /([a-zA-Z0-9-_.]+\/[a-zA-Z0-9-_.]+)?#[0-9]+/;
	const URLRegex = /(http(s)?(:\/\/))(www\.)?[a-zA-Z0-9-_.]+(\.[a-zA-Z0-9]{2,})([-a-zA-Z0-9:%_+.~#?&//=]*)/;
	const linkifiedURLClass = 'rg-linkified-code';
	const commonURLAttrs = `target="_blank" class="${linkifiedURLClass}"`;

	const linkifyIssue = (repoPath, issue) => {
		if (/\//.test(issue)) {
			const issueParts = issue.split('#');
			return `<a href="https://github.com/${issueParts[0]}/issues/${issueParts[1]}" ${commonURLAttrs}>${issue}</a>`;
		}
		return `<a href="https://github.com/${repoPath}/issues/${issue.replace('#', '')}" ${commonURLAttrs}>${issue}</a>`;
	};
	const linkifyURL = url => `<a href="${url}" ${commonURLAttrs}>${url}</a>`;

	const hasIssue = text => issueRegex.test(text);
	const hasURL = text => URLRegex.test(text);

	const linkifyCode = repoPath => {
		// Don't linkify any already linkified code
		if ($(`.${linkifiedURLClass}`).length > 0) {
			return;
		}
		const codeBlobs = $('.blob-code-inner');
		const commentCodeBlobs = $('.blob-code-inner span.pl-c');

		$(codeBlobs)
		.toArray()
		.forEach(blob => {
			const blobHTML = blob.innerHTML;
			if (hasURL(blobHTML)) {
				// Match URLs and remove < or > from beginning or end
				const URLmatch = blobHTML.match(URLRegex)[0].replace(/(^&lt)|(&gt$)/, '');
				blob.innerHTML = blobHTML.replace(URLmatch, linkifyURL(URLmatch));
			}
		});

		$(commentCodeBlobs)
		.toArray()
		.forEach(blob => {
			const blobHTML = blob.innerHTML;
			if (hasIssue(blobHTML)) {
				const issueMatch = blobHTML.match(issueRegex)[0];
				blob.innerHTML = blobHTML.replace(issueMatch, linkifyIssue(repoPath, issueMatch));
			}
		});
	};

	return {
		hasIssue,
		hasURL,
		linkifyCode
	};
})();
