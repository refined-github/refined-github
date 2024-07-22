import {signalFromEvent} from 'abort-utils';

export default function onReactPageUpdate(callback: (signal: AbortSignal) => void, signal: AbortSignal): void {
	document.addEventListener(
		'soft-nav:payload',
		() => {
			const unifiedSignal = AbortSignal.any([
				signal, // User-provided, likely Turbo page navigation event
				signalFromEvent(document, 'soft-nav:payload'), // A "React page"-specific page navigation event
			]);
			callback(unifiedSignal);
		},
		{signal},
	);
}
