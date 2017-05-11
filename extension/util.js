(exports => {
	'use strict';

	exports.debounce = (func, wait, immediate) => {
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

	exports.copyToClipboard = value => {
		const $textArea = $('<textarea>').css({
			opacity: 0,
			position: 'fixed'
		}).appendTo('body').val(value);

		$textArea.select();
		const success = document.execCommand('copy');
		$textArea.remove();

		return success;
	};

    exports.issueRegex = /([a-zA-Z0-9-_.]+\/[a-zA-Z0-9-_.]+)?#[0-9]+/;
	exports.linkifyIssue = (repoPath, issue, attrs) => {
		if (/\//.test(issue)) {
			const issueParts = issue.split('#');
			return `<a href="https://github.com/${issueParts[0]}/issues/${issueParts[1]}" ${attrs}>${issue}</a>`;
		}
		return `<a href="https://github.com/${repoPath}/issues/${issue.replace('#', '')}" ${attrs}>${issue}</a>`;
	};
})(window.utils = {});
