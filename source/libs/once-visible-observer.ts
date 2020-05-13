import {observe, Observer} from 'selector-observer';

export type ElementCallback = (element: Element) => void;

/** Like `IntersectionObserver`, but call callback ONCE when the observed element becomes visible */
export default class OnceVisibleObserver extends IntersectionObserver {
	// `selector-observe` compatibility
	// so it can be used as `observe(selector, new OnceVisibleObserver(callback))`
	add = this.observe.bind(this);
	remove = this.unobserve.bind(this);

	constructor(callback: ElementCallback) {
		super(changes => {
			for (const change of changes) {
				if (change.isIntersecting) {
					callback(change.target);
					this.unobserve(change.target);
				}
			}
		});
	}
}

/**
Like `selector-observe`, but also waits for element to become visible first.
1. Selectors are observed by `selector-observer`
2. The found elements are then observed by `IntersectionObserver`
3. `callback` is called every time an element becomes visible
*/
export function lazilyObserveSelector(
	selector: string,
	callback: ElementCallback
): Observer {
	return observe(selector, new OnceVisibleObserver(callback));
}
