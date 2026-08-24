import delegate, {type DelegateEventHandler} from 'delegate-it';

const fieldSelector = [
	// PR merge message field
	'[data-testid="mergebox-partial"] input[type="text"]',
	// Commit title on edit file page
	'#commit-message-input',
];

export default function onCommitTitleUpdate(
	callback: DelegateEventHandler<Event, HTMLInputElement>,
	signal: AbortSignal,
): void {
	// For immediate user input
	delegate(fieldSelector, 'input', callback, {signal});
}
