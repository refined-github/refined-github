/**
Element.blur() will reset the tab focus to the start of the document.
This places it back next to the blurred field
*/
export default function blurAccessibly(field: HTMLElement): void {
	field.blur();

	const range = new Range();
	const selection = getSelection()!;
	const focusHolder = new Text();
	field.after(focusHolder);
	range.selectNodeContents(focusHolder);
	selection.removeAllRanges();
	selection.addRange(range);
	focusHolder.remove();
}
