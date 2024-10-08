import React from 'react';
import CheckIcon from 'octicons-plain-react/Check';
import CopyIcon from 'octicons-plain-react/Copy';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function addCopyIcon(button: HTMLElement, issueLink: string, issueTitle: string, issueNumber: string): void {
	const copy = (<div
		aria-label="Copy"
		className="Link--onHover color-fg-muted d-inline-block ml-2"
		role="button"
	>
		<CopyIcon className="v-align-baseline" />
	</div>);
	button.after(copy);
	copy.addEventListener('click', () => {
		const textBlob = new Blob([`${issueTitle} ${issueNumber}`], {type: 'text/plain'});
		const htmlBlob = new Blob([`<a href="${issueLink}">${issueTitle}</a> ${issueNumber}`], {type: 'text/html'});

		const clipboardItem = new ClipboardItem({
			[textBlob.type]: textBlob,
			[htmlBlob.type]: htmlBlob,
		});

		navigator.clipboard.write([clipboardItem]);

		const check = <CheckIcon className="v-align-baseline color-fg-success d-inline-block ml-2" />;
		copy.replaceWith(check);
		setTimeout(() => {
			check.replaceWith(copy);
		}, 1000);
	});
}

function addHeaderCopyIcon(button: HTMLElement): void {
	const issueLink = location.href;
	const issueTitle = document.querySelector('.js-issue-title')!.textContent!.trim();
	const issueNumber = document.querySelector('.gh-header-title span')!.textContent!.trim();
	addCopyIcon(button, issueLink, issueTitle, issueNumber);
}

function addRowCopyIcon(button: HTMLAnchorElement): void {
	const issueLink = button.href;
	const issueTitle = button.textContent!.trim();
	const issueNumber = '#' + button.id.split('_')[1];
	addCopyIcon(button, issueLink, issueTitle, issueNumber);
}

function init(signal: AbortSignal): void {
	observe('.gh-header-number', addHeaderCopyIcon, {signal});
	observe('.gh-header-title span', addHeaderCopyIcon, {signal});
	observe('.js-issue-row a.Link--primary', addRowCopyIcon, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPR,
		pageDetect.isIssue,
		pageDetect.isIssueOrPRList,
	],
	init,
});
