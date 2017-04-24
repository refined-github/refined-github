window.linkifyURLsInCode = (() => {
	const issueRegex = /#[0-9]+/;
	const URLRegex = /(http(s)?(:\/\/))(www\.)?[a-zA-Z0-9-_.]+(\.[a-zA-Z0-9]{2,})([-a-zA-Z0-9:%_+.~#?&//=]*)/;
	const linkifyIssue = (repoPath, issue) => `<a href="https://github.com/${repoPath}/issues/${issue.replace('#', '')}">${issue}</a>`;
	const linkifyURL = url => `<a href="${url}">${url}</a>`;

	const hasIssue = text => issueRegex.test(text);
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

			if (hasIssue(blobHTML)) {
				const issueMatch = blobHTML.match(issueRegex)[0];
				blobHTML = blobHTML.replace(issueMatch, linkifyIssue(repoPath, issueMatch));
			}

			blob.innerHTML = blobHTML;
		});
	};

	return {
		hasIssue,
		hasURL,
		linkifyCode
	};
})();
