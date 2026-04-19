import * as pageDetect from 'github-url-detection';
import delegate, {type DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';

function handleSubmit(event: DelegateEvent<Event, HTMLElement>): void {
	if (!confirm('Are you sure you want to publish this release?')) {
		event.stopImmediatePropagation();
		event.preventDefault();
	}
}

function handleSubmitOnCtrlEnter(event: DelegateEvent<KeyboardEvent, HTMLElement>): void {
	if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
		handleSubmit(event);
	}
}

function handleSubmitOnEnter(event: DelegateEvent<KeyboardEvent, HTMLElement>): void {
	if (event.key === 'Enter' && !event.isComposing) {
		handleSubmit(event);
	}
}

function init(signal: AbortSignal): void {
	delegate('button[publish-release="true"]', 'click', handleSubmit, {signal, capture: true});
	delegate('textarea#release_body', 'keydown', handleSubmitOnCtrlEnter, {signal, capture: true});
	delegate('input#release_name', 'keydown', handleSubmitOnEnter, {signal, capture: true});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isNewRelease,
	],
	init,
});

/*

Test URLs:

isNewRelease: https://github.com/refined-github/sandbox/releases/new

*/
