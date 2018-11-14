import {h} from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate';
import onetime from 'onetime';
import * as icons from '../libs/icons';
import * as pageDetect from '../libs/page-detect';
import {metaKey, safeOnAjaxedPages} from '../libs/utils';
import observeEl from '../libs/simplified-element-observer';

function addButtons() {
	for (const toolbar of select.all('form:not(.rgh-has-upload-field) markdown-toolbar')) {
		const form = toolbar.closest('form');
		if (!select.exists('.js-manual-file-chooser[type=file]', form)) {
			continue;
		}
		observeEl(toolbar, function () {
			const toolbarGroup = select('.toolbar-group:last-child', toolbar);
			if (toolbarGroup) {
				toolbarGroup.append(
					<button type="button" class="toolbar-item rgh-upload-btn tooltipped tooltipped-nw" aria-label="Upload attachments">
						{icons.cloudUpload()}
					</button>
				);
				form.classList.add('rgh-has-upload-field');
				this.disconnect();
			}
		});
	}
}

function triggerUploadUI({target}) {
	target
		.closest('form')
		.querySelector('.js-manual-file-chooser') // Find <input [type=file]>
		.click(); // Open UI
}

function handleKeydown(event) {
	if (event[metaKey] && event.key === 'u') {
		triggerUploadUI(event);
		event.preventDefault();
	}
}

function listen() {
	delegate('.rgh-has-upload-field', 'keydown', handleKeydown);
	delegate('.rgh-upload-btn', 'click', triggerUploadUI);
}

export default function () {
	const listenOnce = onetime(listen);
	safeOnAjaxedPages(() => {
		if (pageDetect.isPR() || pageDetect.isIssue() || pageDetect.isNewIssue() || pageDetect.isCompare() || pageDetect.isCommit()) {
			addButtons();
			listenOnce();
		}
	});
}
