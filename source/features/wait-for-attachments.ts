import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function handleFileAttachment(mutations: Array<MutationRecord>): void {
	const target = mutations[0].target as HTMLElement;
	const submitButton = select<HTMLElement>('button[type="submit"]', target.closest('form')!)!;

	if (target.classList.contains('is-uploading')) {
		submitButton.setAttribute('disabled', '');
	} else {
		submitButton.removeAttribute('disabled');
	}
}

function init(): void {
	const observer = new MutationObserver(handleFileAttachment);
	for (const fileAttachment of select.all('file-attachment')) {
		observer.observe(fileAttachment, {attributes: true, attributeFilter: ['class']});
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.hasComments
	],
	init
});
