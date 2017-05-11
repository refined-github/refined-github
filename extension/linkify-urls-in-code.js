/* globals utils */

window.linkifyURLsInCode = (() => {
	const issueRegex = utils.issueRegex;
	const URLRegex = /(http(s)?(:\/\/))(www\.)?[a-zA-Z0-9-_.]+(\.[a-zA-Z0-9]{2,})([-a-zA-Z0-9:%_+.~#?&//=]*)/;
	const linkifiedURLClass = 'rg-linkified-code';
	const commonURLAttrs = `target="_blank" class="${linkifiedURLClass}"`;

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
				blob.innerHTML = blobHTML.replace(issueMatch, utils.linkifyIssueRef(repoPath, issueMatch, commonURLAttrs));
			}
		});
	};

	return {
		hasIssue,
		hasURL,
		linkifyCode
	};
})();
