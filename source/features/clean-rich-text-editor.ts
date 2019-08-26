import './clean-rich-text-editor.css';
import select from 'select-dom';
import features from '../libs/features';

function init(): void {
	document.body.classList.add('rgh-clean-rich-text-editor');

	for (const textarea of select.all('.comment-form-textarea')) {
		textarea.title = '';
	}
}

features.add({
	id: __featureName__,
	description: 'Hides unnecessary comment field tooltips and toolbar items.',
	screenshot: false,
	include: [
		features.hasRichTextEditor
	],
	load: features.onAjaxedPages,
	init
});
