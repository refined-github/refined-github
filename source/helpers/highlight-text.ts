/**
Highlights (case-insensitively) every occurrence of the keywords in the elements via the CSS Custom Highlight API.
Returns a function that removes the highlight.
*/
export default function highlightText(
	name: string,
	elements: Iterable<Element>,
	keywords: readonly string[],
): () => void {
	const ranges: Range[] = [];
	for (const element of elements) {
		const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
		for (let node = walker.nextNode(); node; node = walker.nextNode()) {
			const text = node.textContent!.toLowerCase();
			for (const keyword of keywords) {
				for (
					let index = text.indexOf(keyword);
					index !== -1;
					index = text.indexOf(keyword, index + keyword.length)
				) {
					const range = new Range();
					range.setStart(node, index);
					range.setEnd(node, index + keyword.length);
					ranges.push(range);
				}
			}
		}
	}

	CSS.highlights.set(name, new Highlight(...ranges));

	return () => {
		CSS.highlights.delete(name);
	};
}
