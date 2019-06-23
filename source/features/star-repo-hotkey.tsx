import select from 'select-dom';
import features from '../libs/features';

function init(): void {
	// There are two buttons: unstar and star
	for (const button of select.all('.js-social-form > button')) {
		button.setAttribute('data-hotkey', 'g s');
	}
}

features.add({
	id: __featureName__,
	description: 'Star/unstar a repository by pressing `g` `s`',
	include: [
		features.isRepo
	],
	load: features.onAjaxedPages,
	shortcuts: {
		'g s': 'Star and unstar repository'
	},
	init
});
