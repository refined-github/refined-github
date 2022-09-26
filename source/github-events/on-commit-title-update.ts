import delegate, {DelegateEvent, DelegateEventHandler} from 'delegate-it';
import mem from 'mem';

const fieldSelector = [
	'#commit-summary-input', // Commit title on edit file page
	'#merge_title_field', // PR merge message field
].join(', ');

// This lets you call `onCommitTitleUpdate` multiple times with the same callback but only ever a listener is registered
const delegateHandler = mem((callback: DelegateEventHandler<Event, HTMLInputElement>) => (event: DelegateEvent<Event, HTMLInputElement>) => {
	if (event.delegateTarget.matches('.open')) {
		callback(event);
	}
});

export default function onCommitTitleUpdate(callback: DelegateEventHandler<Event, HTMLInputElement>, signal: AbortSignal): void {
	// GitHub restores the value from the previous session and only triggers this event
	delegate(document, fieldSelector, 'change', delegateHandler(callback), {signal});

	// For immediate user input
	delegate(document, fieldSelector, 'input', delegateHandler(callback), {signal});
}
