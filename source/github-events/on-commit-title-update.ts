import delegate, {type DelegateEventHandler} from 'delegate-it';

const fieldSelector = [
	'#commit-summary-input', // Commit title on edit file page
	'[data-testid="mergebox-partial"] input', // PR merge message field
];

export default function onCommitTitleUpdate(callback: DelegateEventHandler<Event, HTMLInputElement>, signal: AbortSignal): void {
	// For immediate user input
	delegate(fieldSelector, 'input', callback, {signal});
}
