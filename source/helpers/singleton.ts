import {onAbort, ReusableAbortController} from 'abort-utils';

/**
Wrap an initialization function so only its latest invocation remains active.

Like React's `useEffect`, the previous cleanup function is called before
`init` is invoked again.
*/
export default function singleton<T extends (...arguments_: any[]) => any>(init: T): T {
	let unmount: void | (() => void);

	return ((...arguments_: Parameters<T>) => {
		if (typeof unmount === 'function') {
			unmount();
		}

		unmount = init(...arguments_);
	}) as T;
}

/**
Ensure only the latest invocation of `init` remains active.

Each call aborts the previous one and calls `init` with a new `AbortSignal`
that is linked to the caller's `signal`.
*/
export function singletonWithSignal(
	init: (signal: AbortSignal) => void,
): (signal: AbortSignal) => void {
	const controller = new ReusableAbortController();

	return signal => {
		controller.abortAndReset();
		onAbort(signal, controller);
		init(controller.signal);
	};
}
