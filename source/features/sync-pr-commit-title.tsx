import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import debounce from 'debounce-fn';
import delegate, {DelegateSubscription} from 'delegate-it';
import insertTextTextarea from 'insert-text-textarea';
import features from '../libs/features';
import onPrMergePanelOpen from '../libs/on-pr-merge-panel-open';

const commitTitleLimit = 72;
const prTitleFieldSelector = '.js-issue-update [name="issue[title]"]';
const prTitleSubmitSelector = '.js-issue-update [type="submit"]';

const createCommitTitle = debounce<[], string>((): string => {
	const issueTitle = select('.js-issue-title')!.textContent!.trim();
	const issueInfo = ` (${getPRNumber()})`;
	const targetTitleLength = commitTitleLimit - issueInfo.length;

	if (issueTitle.length > targetTitleLength) {
		return issueTitle.slice(0, targetTitleLength - 1).trim() + '…' + issueInfo;
	}

	return issueTitle + issueInfo;
}, {
	wait: 1000,
	immediate: true
});

const getNote = onetime<[], HTMLElement>((): HTMLElement =>
	<p className="note">
		The title of this PR will be updated to match this title. <button type="button" className="btn-link muted-link text-underline" onClick={event => {
			deinit();
			event.currentTarget.parentElement!.remove(); // Hide note
		}}>Cancel</button>
	</p>
);

function getPRNumber(): string {
	return select('.gh-header-number')!.textContent!;
}

function maybeShowNote(): void {
	const inputField = select<HTMLInputElement>('#merge_title_field')!;
	const needsSubmission = createCommitTitle() !== inputField.value;

	if (needsSubmission) {
		if (select.all([prTitleFieldSelector, prTitleSubmitSelector].join()).length !== 2) {
			// Ensure that the required fields are there before adding the note
			throw new Error('Refined GitHub: `sync-pr-commit-title` can’t update the PR title');
		}

		inputField.after(getNote());
		return;
	}

	getNote().remove();
}

function submitPRTitleUpdate(): void {
	const inputField = select<HTMLInputElement>('#merge_title_field')!;

	// If the note isn't shown, the PR title doesn't need to be updated
	if (!getNote().isConnected) {
		return;
	}

	const prTitle = inputField.value.replace(new RegExp(`\\s*\\(${getPRNumber()}\\)$`), '');

	// Fill and submit title-change form
	select<HTMLInputElement>(prTitleFieldSelector)!.value = prTitle;
	select(prTitleSubmitSelector)!.click(); // `form.submit()` isn't sent via ajax
}

function onMergePanelOpen(event: Event): void {
	maybeShowNote();

	const field = select<HTMLTextAreaElement>('#merge_title_field')!;

	// Only if the user hasn't already interacted with it in this session
	if (field.closest('.is-dirty') || event.type === 'session:resume') {
		return;
	}

	// Replace default title and fire the correct events
	field.value = '';
	insertTextTextarea(field, createCommitTitle());
}

let listeners: DelegateSubscription[];
function init(): void {
	listeners = [
		...delegate('#discussion_bucket', '#merge_title_field', 'input', maybeShowNote),
		...delegate('#discussion_bucket', 'form.js-merge-pull-request', 'submit', submitPRTitleUpdate),
		...onPrMergePanelOpen(onMergePanelOpen)
	];
}

function deinit(): void {
	for (const delegation of listeners) {
		delegation.destroy();
	}

	listeners.length = 0;
}

features.add({
	id: __featureName__,
	description: 'Uses the PR’s title and description when merging and updates the PR’s title to the match the commit title, if changed.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/51669708-9a712400-1ff7-11e9-913a-ac1ea1050975.png',
	include: [
		features.isPRConversation
	],
	load: features.onAjaxedPages,
	init
});
