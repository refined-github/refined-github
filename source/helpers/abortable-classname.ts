import {onAbort} from 'abort-utils';

// TODO: Drop after https://github.com/fregante/abort-utils/issues/12
export default function abortableClassName(element: Element, signal: AbortSignal, ...classes: string[]): void {
	element.classList.add(...classes);
	onAbort(signal, () => {
		element.classList.remove(...classes);
	});
}
