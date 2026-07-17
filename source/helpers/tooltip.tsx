import {mount} from 'svelte';

import Tooltip from './tooltip.svelte';

export type TooltipOptions = {
	label: string;
	shortcut?: string;
	direction?: 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';
	type?: 'label' | 'description';
};

function createTooltipFor(element: Element, content: string | TooltipOptions): void {
	// Ensure the element has an ID for the `for` attribute to link to
	element.id ||= crypto.randomUUID();

	const tooltipId = crypto.randomUUID();
	element.setAttribute('aria-labelledby', tooltipId);

	const options = typeof content === 'string' ? {label: content} : content;
	mount(Tooltip, {
		target: element,
		props: {
			id: tooltipId,
			htmlFor: element.id,
			...options,
		},
	});
}

/**
Generates a tooltip for the received element.
@example const button = document.createElement('button'); tooltipped('Does something', button);
@deprecated use `withTooltipRef` instead
*/
export function tooltipped(
	content: string | TooltipOptions,
	element: Element,
): Element {
	createTooltipFor(element, content);
	return element;
}

/**
Attaches a tooltip to an existing element. Don't use this with JSX.
@example addTooltip('Does something', $('.some-existing-button'))
*/
export default function addTooltip(
	content: string | TooltipOptions,
	element: Element,
): void {
	if (!element.parentElement) {
		throw new Error('Element has no parent. Use `tooltipped` instead for elements not yet attached to a parent.');
	}

	createTooltipFor(element, content);
}

/**
Ref callback that attaches a tooltip to the element it's bound to.
@example <summary ref={withTooltipRef('Add a table')}>...</summary>
*/
export function withTooltipRef(
	content: string | TooltipOptions,
	// eslint-disable-next-line @typescript-eslint/no-restricted-types -- Native type
): (element: Element | null) => void {
	return element => {
		if (element) {
			createTooltipFor(element, content);
		}
	};
}
