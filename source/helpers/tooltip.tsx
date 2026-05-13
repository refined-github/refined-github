import React from 'dom-chef';

export type TooltipOptions = {
	label: string;
	shortcut?: string;
	direction?: string;
	type?: 'label' | 'description';
};

function renderShortcut(shortcut: string): Array<string | JSX.Element> {
	return shortcut.split(' ').flatMap((key, index) =>
		index === 0 ? [<kbd>{key}</kbd>] : [' ', <kbd>{key}</kbd>],
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
			{options.shortcut && [' ', ...renderShortcut(options.shortcut)]}
		</tool-tip>
	);
}

/**
Creates a `tool-tip` linked to `element` and returns both for embedding in a JSX tree.

@example
const button = <button type="button">…</button> as HTMLElement;
return <div>{tooltipped(button, 'Does something')}</div>;

// With options:
return <div>{tooltipped(button, {label: 'Does something', shortcut: 'g b', direction: 'n'})}</div>;
*/
export function tooltipped(
	element: Element,
	content: string | TooltipOptions,
): [Element, HTMLElement] {
	return [element, createTooltipFor(element, content)];
}

/**
Creates a `tool-tip` element and inserts it immediately after `element` in the DOM.

`element` must have a parent node. Use `tooltipped` instead for elements not yet attached to a parent.

@example
addToolTip(button, 'Does something');
addToolTip(button, {label: 'Does something', shortcut: 'g b', direction: 'n'});
*/
export default function addToolTip(
	element: Element,
	content: string | TooltipOptions,
): void {
	if (!element.parentNode) {
		throw new Error('Element has no parent. Use `tooltipped` instead for elements not yet attached to a parent.');
	}

	element.after(createTooltipFor(element, content));
}
