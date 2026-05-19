import './tooltip.css';

import React from 'dom-chef';

import {upperCaseFirst} from '../github-helpers/index.js';

export type TooltipOptions = {
	label: string;
	shortcut?: string;
	direction?: 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';
	type?: 'label' | 'description';
};

function renderShortcut(shortcut: string): JSX.Element {
	return (
		<kbd className="rgh-shortcut">
			{shortcut.split(' ').map((key, index) => (
				<>
					{index > 0 && ' '}
					<span className="rgh-shortcut-chord" data-kbd-chord="true">
						{upperCaseFirst(key)}
					</span>
				</>
			))}
		</kbd>
	);
}

function createTooltipFor(element: Element, content: string | TooltipOptions): HTMLElement {
	const options: TooltipOptions = typeof content === 'string'
		? {label: content}
		: content;

	// Ensure the element has an ID for the `for` attribute to link to
	element.id ||= crypto.randomUUID();

	const tooltipId = crypto.randomUUID();
	element.setAttribute('aria-labelledby', tooltipId);

	return (
		<tool-tip
			id={tooltipId}
			className="sr-only position-absolute"
			for={element.id}
			popover="manual"
			data-direction={options.direction ?? 's'}
			data-type={options.type ?? 'label'}
			aria-hidden="true"
			role="tooltip"
		>
			{options.label}
			{options.shortcut && renderShortcut(options.shortcut)}
		</tool-tip>
	);
}

/**
Generates a tooltip for the received element. You should use this when generating elements via JSX

@example return <div>{tooltipped('Does something', <button type="button">...</button>)}</div>;
*/
export function tooltipped(
	content: string | TooltipOptions,
	element: Element,
): Element {
	const tooltip = createTooltipFor(element, content);
	element.append(tooltip);
	return element;
}

/**
Attaches a tooltip to an existing element. Don't use this with JSX.

@example addToolTip('Does something', $('.some-existing-button'))
*/
export default function addToolTip(
	content: string | TooltipOptions,
	element: Element,
): void {
	if (!element.parentElement) {
		throw new Error('Element has no parent. Use `tooltipped` instead for elements not yet attached to a parent.');
	}

	element.append(createTooltipFor(element, content));
}
