// The `pjax:*` event handlers redirect the old events to the new listeners.
// The `turbo:` handler drops the polyfill when it detects a "native" turbo event.
// This pattern lets us just drop this file when GHE gains these new native events, without further changes to the codebase.
export default function polyfillTurboEvents(): void {
	document.addEventListener('pjax:start', dispatchTurboEvent);
	document.addEventListener('pjax:end', dispatchTurboEvent);
	document.addEventListener('turbo:visit', disconnectPolyfill, {once: true});
}

function dispatchTurboEvent(event: Event): void {
	document.removeEventListener('turbo:visit', disconnectPolyfill);

	const turboEvent = event.type === 'pjax:start' ? 'turbo:visit' : 'turbo:render';
	document.dispatchEvent(new CustomEvent(turboEvent));
}

function disconnectPolyfill(): void {
	document.removeEventListener('pjax:start', dispatchTurboEvent);
	document.removeEventListener('pjax:end', dispatchTurboEvent);
}
