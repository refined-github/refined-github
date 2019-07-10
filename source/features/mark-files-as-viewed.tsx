import select from 'select-dom';
import delegate from 'delegate-it';
import features from '../libs/features';

function markAllFilesAsViewed(): void {
	for (const checkbox of select.all('.js-reviewed-checkbox')) {
		checkbox.click();
	}
}

function init(): void {
	delegate('.form-actions button[value="approve"]', 'click', () => markAllFilesAsViewed());
}

features.add({
	id: __featureName__,
	description: 'Mark all files as viewed when approving a PR',
	include: [
		features.isPR
	],
	init
});
