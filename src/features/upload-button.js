import {h} from 'dom-chef';
import onetime from 'onetime';
import select from 'select-dom';
import {metaKey} from '../libs/utils';
import * as icons from '../libs/icons';

function addButtons() {
	for (const form of select.all('.js-previewable-comment-form:not(.rgh-has-upload-field)')) {
		if (select.exists('.js-manual-file-chooser[type=file]', form)) {
			form.classList('rgh-has-upload-field');
			const toolbarPosition = select('.js-saved-reply-container', form);
			if (toolbarPosition) {
				toolbarPosition.after(
					<button type="button" class="toolbar-item tooltipped tooltipped-nw rgh-upload-btn" aria-label="Upload a file">
						{icons.cloudUpload()}
					</button>
				);
			}
		}
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
	$(document).on('keydown', '.rgh-has-upload-field', handleKeydown);
	$(document).on('click', '.rgh-upload-btn', triggerUploadUI);
});

export default function () {
	addButtons();
	listenOnce();
}
