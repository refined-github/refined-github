import select from 'select-dom';
import delegate from 'delegate';

/**
 * Smart Delegate
 * Handles more types of input
 * @param {Element|CSS selector|Array} [baseElement=document]
 *        The element where the delegating listener is attached
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @param {Boolean} useCapture
 *
 * @return {Object|Object[]}
 *         Object with `.destroy()` method to detach listener,
 *         or an array of these objects when `baseElement` is an array or a selector
 */
export default function (...args) {
	let baseElement = args[0];

	// Default usage
	if (baseElement.addEventListener) {
		return delegate(...args);
	}

	// Base-less usage
	if (typeof args[2] === 'function') {
		return delegate(document, ...args);
	}

	// Selector as base
	if (typeof baseElement === 'string') {
		baseElement = select.all(baseElement);
	}

	const [, ...argsWithoutBase] = args;
	return baseElement.map(
		element => delegate(element, ...argsWithoutBase)
	);
}
