/*
Soft-wrap code inside codeblocks
*/
import './softwrap-code.css';
import select from 'select-dom';
import features from '../libs/features';

async function init(): Promise<void> {
	const tables = select.all([
		'.diff-table:not(.rgh-softwrapped-code)', // Split and unified diffs
		'.d-table:not(.rgh-softwrapped-code)', // "Suggested changes" in PRs
		'.js-file-line-container:not(.rgh-softwrapped-code)' // Embedded code blocks
	].join());

	for (const table of tables) {
		table.classList.add('rgh-softwrapped-code');

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
				if (char === '\t') {
					tabCount += 1;
				} else {
					// Consider every other "space" character as one "blank space" character
					spaceCount += 1;
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

features.add({
	id: 'softwrap-code',
	load: features.onAjaxedPages,
	init
});
