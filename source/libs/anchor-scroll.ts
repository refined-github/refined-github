export default async function anchorScroll(
	action: VoidFunction | AsyncVoidFunction,
	anchor: Element = document.elementFromPoint(innerWidth / 2, innerHeight / 2)!
): Promise<void> {
	if (anchor) {
		const originalPosition = anchor.getBoundingClientRect().top;

		await action();

		requestAnimationFrame(() => {
			const newPositon = anchor.getBoundingClientRect().top;
			window.scrollBy(0, newPositon - originalPosition);
		});
	} else {
		// Anchor not found; proceed without anchoring
		action();
	}
}
