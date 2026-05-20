import delegate, {type DelegateEventHandler} from 'delegate-it';

const fieldSelector = [
	// PR merge message field
	'[data-testid="mergebox-partial"] input[type="text"]',
	// Commit title on edit file page
	'#commit-message-input',
	// Commit title on edit file page before some update
	// TODO [2026-08-01]: Remove
	'#commit-summary-input',
];

export default function onCommitTitleUpdate(
	callback: DelegateEventHandler<Event, HTMLInputElement>,
	signal: AbortSignal,
): void {
	// For immediate user input
	delegate(fieldSelector, 'input', callback, {signal});
}
