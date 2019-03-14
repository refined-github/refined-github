import select from 'select-dom';
import features, {FeatureInit} from '../libs/features';

function init(): FeatureInit {
	const btn = select('.merge-message .btn-group-squash [type=button]');
	if (!btn) {
		return false;
	}

	btn.addEventListener('click', () => {
		const title = select('.js-issue-title')!.textContent!;
		const number = select('.gh-header-number')!.textContent;
		select<HTMLTextAreaElement>('#merge_title_field')!.value = `${title.trim()} (${number})`;
	});
}

features.add({
	id: 'fix-squash-and-merge-title',
	include: [
		features.isPR
	],
	load: features.onAjaxedPages,
	init
});
