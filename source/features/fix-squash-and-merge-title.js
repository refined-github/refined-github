import select from 'select-dom';
import observeEl from '../libs/simplified-element-observer';

function updateSquashAndMergeTitle() {
	const title = select('.js-issue-title').textContent;
	const number = select('.gh-header-number').textContent;
	select('#merge_title_field').value = `${title.trim()} (${number})`;
}

export default function () {
	const btn = select('.merge-message .btn-group-squash [type=submit]');
	if (!btn) {
		return;
	}

	btn.addEventListener('click', updateSquashAndMergeTitle);

	// Watch for any changes to the PR title
	observeEl('.js-issue-title', updateSquashAndMergeTitle);
}
