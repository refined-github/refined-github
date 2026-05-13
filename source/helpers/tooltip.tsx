import React from 'dom-chef';

export type TooltipOptions = {
	label: string;
	shortcut?: string;
	direction?: string;
	type?: 'label' | 'description';
};

function renderShortcut(shortcut: string): Array<string | JSX.Element> {
	return shortcut.split(' ').flatMap(key => [
		' ',
		<kbd>{key}</kbd>,
	]);
}

/**
Creates and links a `tool-tip` element to the given element.

If `element` is already in the DOM, the tooltip is automatically inserted after it.
Otherwise, the tooltip is returned for manual insertion alongside the element.

@example
// Element already in DOM:
addToolTip(button, 'Does something');

// Building a JSX tree:
const button = <button type="button">…</button> as HTMLButtonElement;
return <div>{button}{addToolTip(button, 'Does something')}</div>;

// With options:
addToolTip(button, {label: 'Does something', shortcut: 'g b', direction: 'n'});
*/
export default function addToolTip(
	element: Element,
	content: string | TooltipOptions,
): HTMLElement {
	const options: TooltipOptions = typeof content === 'string'
		? {label: content}
		: content;

	// Ensure the element has an ID for the `for` attribute to link to
	element.id ||= crypto.randomUUID();

	const tooltipId = crypto.randomUUID();

	const tooltip = (
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
	) as HTMLElement;

	// If element has a parent, insert tooltip after it (works for connected or unconnected subtrees)
	element.after(tooltip);

	element.setAttribute('aria-labelledby', tooltipId);

	return tooltip;
}
