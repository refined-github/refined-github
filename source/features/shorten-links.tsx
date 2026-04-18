import features from '../feature-manager.js';
import { linkifiedUrlClass, shortenLink } from '../github-helpers/dom-formatters.js';
import onetime from '../helpers/onetime.js';
import observe from '../helpers/selector-observer.js';

/* This feature is currently so broad that it's not de-inited via signal, it's just run once for all pageloads #5889 */
function initOnce(): void {
	observe([
		`.comment-body a[href]:not(.${linkifiedUrlClass})`,
		`.react-issue-comment .markdown-body a[href]:not(.${linkifiedUrlClass})`, // Issue comments
		`.react-issue-body .markdown-body a[href]:not(.${linkifiedUrlClass})`, // First issue comment
		`[data-testid="review-thread"] .markdown-body a[href]:not(.${linkifiedUrlClass})`, // React commit view
	], shortenLink);
}

void features.add(import.meta.url, {
	init: onetime(initOnce),
});

/*
## Test URLs

https://github.com/refined-github/sandbox/pull/14
https://github.com/refined-github/refined-github/pull/473
*/
