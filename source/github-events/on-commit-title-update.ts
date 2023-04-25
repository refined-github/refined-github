import delegate, {DelegateEventHandler} from 'delegate-it';

const fieldSelector = [
	'#commit-summary-input', // Commit title on edit file page
	'#merge_title_field', // PR merge message field
].join(', ');

export default function onCommitTitleUpdate(callback: DelegateEventHandler<Event, HTMLInputElement>, signal: AbortSignal): void {
	// GitHub restores the value from the previous session and only triggers this event
	delegate(fieldSelector, 'change', callback, {signal});

	// For immediate user input
	delegate(fieldSelector, 'input', callback, {signal});
}
