import delegate, {type DelegateEventHandler} from 'delegate-it';

const fieldSelector = [
	// PR merge message field
	'[data-testid="mergebox-partial"] input',
	// Commit title on edit file page
	'#commit-message-input',
	// Commit title on edit file page before some update - TODO: Remove after July 2026
	'#commit-summary-input',
];

export default function onCommitTitleUpdate(callback: DelegateEventHandler<Event, HTMLInputElement>, signal: AbortSignal): void {
	// For immediate user input
	delegate(fieldSelector, 'input', callback, {signal});
}
