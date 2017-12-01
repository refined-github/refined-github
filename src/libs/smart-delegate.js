import select from 'select-dom';
import delegate from 'delegate';

export default function (elements, ...args) {
	if (!elements) {
		return;
	}

	// Is it a single element?
	if (elements === Node.ELEMENT_NODE) {
		return delegate(elements, ...args);
	}

	// Is it a selector?
	if (typeof elements === 'string') {
		elements = select.all(elements);
	}

	return elements.map(
		element => delegate(element, ...args)
	);
}
