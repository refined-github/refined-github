/** Like `IntersectionObserver`, but call callback ONCE when the observed element becomes visible */
export default class OnceVisibleObserver extends IntersectionObserver {
	constructor(callback: (element: Element) => void) {
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
