import select from 'select-dom';
import features from '../libs/features';

function init() {
	const btn = select('.merge-message .btn-group-squash [type=button]');
	if (!btn) {
		return false;
	}

	btn.addEventListener('click', () => {
		const title = select('.js-issue-title').textContent;
		const number = select('.gh-header-number').textContent;
		select<HTMLTextAreaElement>('#merge_title_field').value = `${title.trim()} (${number})`;
	});
}

features.add({
	id: 'fix-squash-and-merge-title',
	description: 'Use the pull request title as the commit title when merging with `Squash and merge`',
	include: [
		features.isPR
	],
	load: features.onAjaxedPages,
	init
});
