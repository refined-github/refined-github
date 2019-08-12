import './review-comments-hidden-indicator.css';
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import observeEl from '../libs/simplified-element-observer';
import anchorScroll from '../libs/anchor-scroll';
import * as icons from '../libs/icons';

const COMMENT_CONTAINER_SELECTOR = 'tr.inline-comments';
const COMMENTS_SELECTOR = '.review-comment .js-comment';

// Toggle comments while maintaining scroll position
const toggleComments = (event: React.MouseEvent<HTMLButtonElement>): void => {
	anchorScroll(
		() => {
			(event.target as Element)
				.closest('.file.js-file')!
				.querySelector<HTMLInputElement>('.js-toggle-file-notes')!
				.click();
		},
		event.target as Element
	);
};

const hasIndicator = (container: HTMLElement): boolean => {
	const prev = container.previousElementSibling;
	return !!prev && prev.matches('tr.rgh-comments-indicator');
};

const addIndicator = (container: HTMLElement): void => {
	const commentCount = container.querySelectorAll(COMMENTS_SELECTOR).length;
	if (!commentCount) {
		return;
	}

	container.before(
		<tr className="rgh-comments-indicator">
			<td className="blob-num" colSpan={2}>
				<button onClick={toggleComments}>
					{icons.comment()}
					<span>{commentCount}</span>
				</button>
			</td>
		</tr>
	);
};

const addIndicators = (containers: HTMLElement[]): void => {
	containers.filter(el => !hasIndicator(el)).forEach(addIndicator);
};

// Watch for comment hide (removal of .show-inline-notes) to add new
// indicators
const commentToggleListener = (mutations: MutationRecord[]): void => {
	for (const mutation of mutations) {
		const file = mutation.target as HTMLElement;
		const wasVisible = mutation.oldValue!.includes('show-inline-notes');
		const isHidden = !file.classList.contains('show-inline-notes');
		if (wasVisible && isHidden) {
			addIndicators(select.all(COMMENT_CONTAINER_SELECTOR, file));
		}
	}
};

const updateIndicatorsOnHide = (file: HTMLElement): void => {
	observeEl(file, commentToggleListener, {
		attributes: true,
		attributeOldValue: true,
		attributeFilter: ['class']
	});
};

function init(): void {
	addIndicators(select.all(COMMENT_CONTAINER_SELECTOR));
	select.all('.file.js-file').forEach(updateIndicatorsOnHide);
}

features.add({
	id: __featureName__,
	description: 'Adds comment indicators when comments are hidden in PR review',
	screenshot:
		'https://user-images.githubusercontent.com/1402241/35480123-68b9af1a-043a-11e8-8934-3ead3cff8328.gif', // TODO
	include: [
		features.isPRFiles
	],
	load: features.onAjaxedPages,
	init
});
