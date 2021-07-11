// Wraps string in at least two newlines on each side,
// as long as the field doesn't already have them.
// Code adapted from GitHub.
export default function smartBlockWrap(
	content: string,
	field: HTMLTextAreaElement,
): string {
	const before = field.value.slice(0, field.selectionStart);
	const after = field.value.slice(field.selectionEnd);
	const [whitespaceAtStart] = /\n*$/.exec(before)!;
	const [whitespaceAtEnd] = /^\n*/.exec(after)!;
	let newlinesToAppend = '';
	let newlinesToPrepend = '';
	if (/\S/.test(before) && whitespaceAtStart.length < 2) {
		newlinesToPrepend = '\n'.repeat(2 - whitespaceAtStart.length);
	}

	if (/\S/.test(after) && whitespaceAtEnd.length < 2) {
		newlinesToAppend = '\n'.repeat(2 - whitespaceAtEnd.length);
	}

	return newlinesToPrepend + content + newlinesToAppend;
}
