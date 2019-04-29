/*
Soft-wrap code inside codeblocks
*/
import './softwrap-code.css';
import select from 'select-dom';
import features from '../libs/features';

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
		for (const line of select.all('.blob-code-inner', table)) {
			if (!line.firstChild || !line.firstChild.textContent) {
				continue;
			}

			const leadingSpaceCharacters = line.firstChild!.textContent!.match(/^\s+/);
			if (!leadingSpaceCharacters) {
				continue;
			}
				let spaceCount = 0;
				let tabCount = 0;
				for (const char of leadingSpaceCharacters[0]) {
					if (char === ' ') {
						spaceCount += 1;
					} else if (char === '\t') {
						tabCount += 1;
					}
				}

				// Move the whole line where it is supposed to be, then unindent the
				// start of the line to compensate for indentation, preserving spaces
				// We might get `--tab-size` from compatible extensions like `github-custom-tab-size`
				line.style.paddingLeft = `calc((var(--tab-size, 4) * ${tabCount}ch) + ${spaceCount}ch)`;
				line.style.textIndent = `calc((var(--tab-size, 4) * -${tabCount}ch) - ${spaceCount}ch)`;
			}
		}
	}
}

features.add({
	id: 'softwrap-code',
	load: features.onAjaxedPages,
	init
});
