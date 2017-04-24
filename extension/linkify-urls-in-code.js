window.linkifyURLsInCode = (() => {
	const issueRegex = /([a-zA-Z0-9-_.]+\/[a-zA-Z0-9-_.]+)?#[0-9]+/;
	const URLRegex = /(http(s)?(:\/\/))(www\.)?[a-zA-Z0-9-_.]+(\.[a-zA-Z0-9]{2,})([-a-zA-Z0-9:%_+.~#?&//=]*)/;
	const linkifyIssue = (repoPath, issue) => {
		if (/\//.test(issue)) {
			const issueParts = issue.split('#');
			return `<a href="https://github.com/${issueParts[0]}/issues/${issueParts[1]}" target="_blank">${issue}</a>`;
		}
		return `<a href="https://github.com/${repoPath}/issues/${issue.replace('#', '')}" target="_blank">${issue}</a>`;
	};
	const linkifyURL = url => `<a href="${url}" target="_blank">${url}</a>`;

	const hasIssue = text => issueRegex.test(text);
	const hasCommentClass = text => /<span.+class="pl-c".+/.test(text);
	const hasURL = text => URLRegex.test(text);

	const linkifyCode = repoPath => {
		const codeBlobs = $('.blob-code-inner');

		$(codeBlobs)
		.toArray()
		.forEach(blob => {
			let blobHTML = blob.innerHTML;
			if (hasURL(blobHTML)) {
				// Match URLs and remove < or > from beginning or end
				const URLmatch = blobHTML.match(URLRegex)[0].replace(/(^&lt)|(&gt$)/, '');
				blobHTML = blobHTML.replace(URLmatch, linkifyURL(URLmatch));
			}

			// Hacky way to ensure only issue number inside a comment, even starting midline
			if (hasIssue(blobHTML)) {
				const issueMatch = blobHTML.match(issueRegex)[0];
				if (hasCommentClass(blobHTML.toString().split(issueMatch)[0])) {
					blobHTML = blobHTML.replace(issueMatch, linkifyIssue(repoPath, issueMatch));
				}
			}

			blob.innerHTML = blobHTML;
		});
	};

	return {
		hasIssue,
		hasCommentClass,
		hasURL,
		linkifyCode
	};
})();
