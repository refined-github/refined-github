import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

function onKeyDown(event: delegate.Event<KeyboardEvent, HTMLFormElement>): void {
	if (event.key === 'Enter') {
		event.preventDefault();
		( !pageDetect.isNewFile() && !pageDetect.isEditingFile() )? 
			select('textarea', event.delegateTarget.form)!.focus() :                    // if not isNewFile and not isEditingFile
			select('#commit-description-textarea', event.delegateTarget.form)!.focus(); // else
	}
}

function init(): void {
	delegate(document, 'input#issue_title, input#pull_request_title, input#commit-summary-input', 'keydown', onKeyDown);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isNewIssue,
		() => pageDetect.isCompare() && select.exists('#new_pull_request'),
		pageDetect.isNewFile,
		pageDetect.isEditingFile
	],
	init
});
