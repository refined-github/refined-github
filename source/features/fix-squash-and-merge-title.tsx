import select from 'select-dom';
import features from '../libs/features';
import observeEl from '../libs/simplified-element-observer';

function updateSquashAndMergeTitle() {
	const title = select('.js-issue-title').textContent;
	const number = select('.gh-header-number').textContent;
	select<HTMLTextAreaElement>('#merge_title_field').value = `${title.trim()} (${number})`;
}

function init() {
	const btn = select('.merge-message .btn-group-squash [type=button]');
	if (!btn) {
		return false;
	}

	btn.addEventListener('click', updateSquashAndMergeTitle);
	observeEl('.js-issue-title', updateSquashAndMergeTitle);
}

features.add({
	id: 'fix-squash-and-merge-title',
	include: [
		features.isPR
	],
	load: features.onAjaxedPages,
	init
});
