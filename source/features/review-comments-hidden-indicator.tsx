import './review-comments-hidden-indicator.css';
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import observeEl from '../libs/simplified-element-observer';
import anchorScroll from '../libs/anchor-scroll';
import * as icons from '../libs/icons';

const SELECTOR_COMMENT_CONTAINER = 'tr.inline-comments';
const SELECTOR_CUSTOM_TOGGLE = 'tr.refined-toggle-comments';
const SELECTOR_COMMENT = '.review-comment .js-comment';

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

const removeToggles = (): void => {
	const toRemove = select.all(SELECTOR_CUSTOM_TOGGLE).filter(el => {
		const next = el.nextElementSibling;
		return !next || !next.matches(SELECTOR_COMMENT_CONTAINER);
	});
	toRemove.forEach(el => el.remove());
};

const addToggle = (container: HTMLElement): void => {
	const commentCount = select.all(SELECTOR_COMMENT, container).length;
	if (!commentCount) {
		return;
	}

	container.before(
		<tr className="refined-toggle-comments">
			<td className="blob-num" colSpan={2}>
				<button onClick={toggleComments}>
					{icons.comment()}
					<span>{commentCount}</span>
				</button>
			</td>
		</tr>
	);
};

function init(): void {
	select.all(SELECTOR_COMMENT_CONTAINER).forEach(el => addToggle(el));

	// Watch for addition/deletion of comment containers
	const onTableMutation = (mutations: MutationRecord[]): void => {
		for (const mutation of mutations) {
			if (mutation.target.nodeType !== 1) {
				continue;
			}

			const target = mutation.target as HTMLElement;
			if (!target.matches('td.line-comments')) {
				continue;
			}

			const container = target.closest(
				SELECTOR_COMMENT_CONTAINER
			) as HTMLElement;
			const comments = select.all(SELECTOR_COMMENT, container);
			if (comments.length === 0) {
				removeToggles();
			} else {
				addToggle(container);
			}
		}
	};

	select.all('.diff-table tbody').forEach(tbody => {
		observeEl(tbody, onTableMutation, {childList: true, subtree: true});
	});
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
