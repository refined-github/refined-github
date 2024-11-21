export default function replaceElementTypeInPlace<Type extends keyof HTMLElementTagNameMap>(
	oldElement: Element,
	type: Type,
): HTMLElementTagNameMap[Type] {
	const newElement = document.createElement(type);
	for (const {name, value} of oldElement.attributes) {
		newElement.setAttribute(name, value);
	}

	newElement.append(...oldElement.children);
	oldElement.replaceWith(newElement);
	return newElement;
}
