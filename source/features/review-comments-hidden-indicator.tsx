import './review-comments-hidden-indicator.css';
import mem from 'mem';
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import anchorScroll from '../libs/anchor-scroll';
import onPrFileLoad from '../libs/on-pr-file-load';
import * as icons from '../libs/icons';

// When an indicator is clicked, this will show comments on the current file
const handleIndicatorClick = ({currentTarget}: React.MouseEvent<HTMLElement>): void => {
	const commentedLine = currentTarget.closest('tr')!.previousElementSibling!;
	anchorScroll(() => {
		currentTarget
			.closest('.file.js-file')!
			.querySelector<HTMLInputElement>('.js-toggle-file-notes')!
			.click();
	}, commentedLine);
};

// `mem` avoids adding the indicator twice to the same thread
const addIndicator = mem((commentThread: HTMLElement): void => {
	const commentCount = commentThread.querySelectorAll('.review-comment .js-comment').length;

	commentThread.before(
		<tr className="rgh-comments-indicator">
			<td className="blob-num" colSpan={2} onClick={handleIndicatorClick}>
				<button type="button">
					{icons.comment()}
					<span>{commentCount}</span>
				</button>
			</td>
		</tr>
	);
}, {
	// TODO: Drop ignore after https://github.com/sindresorhus/p-memoize/issues/9
	// @ts-ignore
	cacheKey: element => element
});

// Add indicator when the `show-inline-notes` class is removed (i.e. the comments are hidden)
const observer = new MutationObserver(mutations => {
	for (const mutation of mutations) {
		const file = mutation.target as HTMLElement;
		const wasVisible = mutation.oldValue!.includes('show-inline-notes');
		const isHidden = !file.classList.contains('show-inline-notes');
		if (wasVisible && isHidden) {
			for (const thread of select.all('tr.inline-comments', file)) {
				addIndicator(thread);
			}
		}
	}
});

function observeFiles(): void {
	for (const element of select.all('.file.js-file')) {
		// #observe won't observe the same element twice
		observer.observe(element, {
			attributes: true,
			attributeOldValue: true,
			attributeFilter: ['class']
		});
	}
}

function init(): void {
	observeFiles();
	onPrFileLoad(observeFiles);
}

features.add({
	id: __featureName__,
	description: 'Adds comment indicators when comments are hidden in PR review',
	screenshot:
		'https://user-images.githubusercontent.com/1402241/35480123-68b9af1a-043a-11e8-8934-3ead3cff8328.gif', // TODO
	include: [
		features.isPRFiles,
		features.isPRCommit
	],
	load: features.onAjaxedPages,
	init
});
