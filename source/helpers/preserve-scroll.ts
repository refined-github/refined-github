export default function preserveScroll(
	anchor: Element = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2)!,
): VoidFunction {
	const originalPosition = anchor.getBoundingClientRect().top;

	/**
	Resets the previously-saved scroll
	*/
	return () => {
		requestAnimationFrame(() => {
			const newPosition = anchor.getBoundingClientRect().top;
			window.scrollBy(0, newPosition - originalPosition);
		});
	};
}
