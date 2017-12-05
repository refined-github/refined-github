import {h} from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import delegate from 'delegate';
import {metaKey} from '../libs/utils';
import * as icons from '../libs/icons';

function addButtons() {
	for (const form of select.all('.js-previewable-comment-form:not(.rgh-has-upload-field)')) {
		if (!select.exists('.js-manual-file-chooser[type=file]', form)) {
			continue;
		}
		form.classList.add('rgh-has-upload-field');
		const toolbarPosition = select('.js-saved-reply-container', form);
		if (!toolbarPosition) {
			continue;
		}
		toolbarPosition.after(
			<button type="button" class="toolbar-item rgh-upload-btn">
				{icons.cloudUpload()}
			</button>
		);
	}
}

function triggerUploadUI({target}) {
	target
		.closest('.js-previewable-comment-form') // Find container form
		.querySelector('.js-manual-file-chooser') // Find <input [type=file]>
		.click(); // Open UI
}

function handleKeydown(event) {
	if (event[metaKey] && event.key === 'u') {
		triggerUploadUI(event);
		event.preventDefault();
	}
}

// Delegated events don't need to be added on ajax loads.
// Unfortunately they aren't natively deduplicated, so onetime is required.
const listenOnce = onetime(() => {
	delegate('.rgh-has-upload-field', 'keydown', handleKeydown);
	delegate('.rgh-upload-btn', 'click', triggerUploadUI);
});

export default function () {
	addButtons();
	listenOnce();
}
