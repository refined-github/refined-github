import {h} from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate';
import {metaKey} from '../libs/utils';
import * as icons from '../libs/icons';
import observeEl from '../libs/simplified-element-observer';

let delegations;

async function addButtons() {
	for (const form of select.all('.js-previewable-comment-form:not(.rgh-has-upload-field)')) {
		if (!select.exists('.js-manual-file-chooser[type=file]', form)) {
			continue;
		}

		const toolbar = select('markdown-toolbar', form);

		const observer = observeEl(toolbar, () => {
			if (select.exists('.js-saved-reply-container', toolbar)) {
				const toolbarPosition = select('.toolbar-group:last-child', toolbar);
				if (!toolbarPosition) {
					return;
				}

				toolbarPosition.append(
					<button type="button" class="toolbar-item rgh-upload-btn">
						{icons.cloudUpload()}
					</button>
				);

				form.classList.add('rgh-has-upload-field');
				observer.disconnect();
			}
		});
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

export default function () {
	addButtons();

	if (delegations) {
		delegations.map(d => d.destroy());
		delegations = null;
	}

	delegations = delegate('.rgh-has-upload-field', 'keydown', handleKeydown);

	delegate('.rgh-upload-btn', 'click', triggerUploadUI);
}
