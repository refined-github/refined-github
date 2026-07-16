import {mount} from 'svelte';

import Tooltip from './tooltip.svelte';

export type TooltipOptions = {
	label: string;
	shortcut?: string;
	direction?: 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';
	type?: 'label' | 'description';
};

function createTooltipFor(element: Element, content: string | TooltipOptions): void {
	const options: TooltipOptions = typeof content === 'string'
		? {label: content}
		: content;

	// Ensure the element has an ID for the `for` attribute to link to
	element.id ||= crypto.randomUUID();

	const tooltipId = crypto.randomUUID();
	element.setAttribute('aria-labelledby', tooltipId);

	mount(Tooltip, {
		target: element as HTMLElement,
		props: {id: tooltipId, for: element.id, options},
	});
}

/**
Generates a tooltip for the received element. You should use this when generating elements via JSX

@example return <div>{tooltipped('Does something', <button type="button">...</button>)}</div>;
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
