import type {ParseSelector} from 'typed-query-selector/parser.d.js';
import delegate, {type DelegateEventHandler, type DelegateOptions} from 'delegate-it';
import {isAlteredClick} from 'filter-altered-clicks';

export default function onAlteredClick<Selector extends string>(
	selector: Selector | readonly Selector[],
	callback: DelegateEventHandler<PointerEvent, ParseSelector<Selector>>,
	options?: DelegateOptions,
): void {
	const finalOptions = {
		...options,
		capture: true,
	} satisfies DelegateOptions;

	const clickListener: typeof callback = event => {
		if (isAlteredClick(event)) {
			callback(event);
		}
	};

	const auxClickListener: typeof clickListener = event => {
		// Is middle click
		if (event.button === 1) {
			callback(event);
		}
	};

	// Prevents auto-scrolling
	const mousedownListener = (event: MouseEvent): void => {
		event.preventDefault();
	};

	delegate(
		selector,
		'click',
		clickListener,
		finalOptions,
	);

	delegate(
		selector,
		'auxclick',
		auxClickListener,
		finalOptions,
	);

	delegate(
		selector,
		'mousedown',
		mousedownListener,
		finalOptions,
	);
}
