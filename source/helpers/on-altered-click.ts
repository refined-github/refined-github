import type {ParseSelector} from 'typed-query-selector/parser.d.js';
import delegate, {type DelegateEventHandler, type DelegateOptions} from 'delegate-it';
import {isAlteredClick} from 'filter-altered-clicks';

function isMiddleClick(event: MouseEvent): boolean {
	return event.button === 1;
}

export default function onAlteredClick<Selector extends string>(
	selector: Selector | readonly Selector[],
	callback: DelegateEventHandler<PointerEvent, ParseSelector<Selector>>,
	options?: DelegateOptions,
): void {
	const clickListener: typeof callback = event => {
		if (isAlteredClick(event)) {
			callback(event);
		}
	};

	const auxClickListener: typeof callback = event => {
		if (isMiddleClick(event)) {
			callback(event);
		}
	};

	const preventAutoScrolling = (event: MouseEvent): void => {
		if (isMiddleClick(event)) {
			event.preventDefault();
		}
	};

	delegate(selector, 'click', clickListener, {capture: true, ...options});
	delegate(selector, 'auxclick', auxClickListener, {capture: true, ...options});
	delegate(selector, 'mousedown', preventAutoScrolling, {...options, capture: true});
}
