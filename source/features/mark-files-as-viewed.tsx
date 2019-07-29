import select from 'select-dom';
import delegate from 'delegate-it';
import features from '../libs/features';

function markAllFilesAsViewed(): void {
	for (const checkbox of select.all('.js-reviewed-checkbox:not(:checked)')) {
		checkbox.click();
	}
}

function init(): void {
	delegate('.form-actions button[value="approve"]', 'click', () => markAllFilesAsViewed());
}

features.add({
	disabled: '#2252',
	id: __featureName__,
	description: 'Marks all files as "viewed" when approving a PR.',
	screenshot: 'https://user-images.githubusercontent.com/11782/60969312-8740df00-a31f-11e9-8e34-d1f0c1a871aa.gif',
	include: [
		features.isPR
	],
	init
});
