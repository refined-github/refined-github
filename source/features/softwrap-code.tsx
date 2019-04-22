/*
Soft-wrap code inside codeblocks
*/
import select from 'select-dom';
import features from '../libs/features';

const tabSize = 4;

async function init(): Promise<void> {
	// Classes:
	// `.diff-table` - Split and unified diffs
	// `.d-table` - Suggested changes
	// `.js-file-line-container` - Embedded code blocks
	const tables = select.all('.diff-table, .d-table, .js-file-line-container');

	for (const table of tables) {
		if (table.classList.contains('rgh-softwrapped-code')) {
			continue;
		}

		table.classList.add('rgh-softwrapped-code');

		const lines = select.all('.blob-code-inner', table);
		for (const line of lines) {
			const leadingSpaceCharacters = line.innerHTML.match(/^\s+/);
			if (leadingSpaceCharacters) {
				let spaceCount = 0;
				for (const char of leadingSpaceCharacters[0]) {
					if (char === ' ') {
						spaceCount += 1;
					} else if (char === '\t') {
						spaceCount += tabSize;
					}
				}

				// Move the whole line where it is supposed to be, then unindent the
				// start of the line to compensate for indentation, preserving spaces
				line.style.paddingLeft = `${spaceCount}ch`;
				line.style.textIndent = `-${spaceCount}ch`;
			}
		}
	}
}

features.add({
	id: 'softwrap-code',
	// include: [
	// 	features.isPRConversation
	// ],
	load: features.onNewComments,
	init
});
