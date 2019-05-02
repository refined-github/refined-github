/*
Wrap code inside all code blocks to match indentation
*/
import './indentation-aware-code-wrapping.css';
import select from 'select-dom';
import features from '../libs/features';

async function init(): Promise<void> {
	const tables = select.all([
		'.file .diff-table:not(.rgh-softwrapped-code)', // Split and unified diffs
		'.file .d-table:not(.rgh-softwrapped-code)', // "Suggested changes" in PRs
		'.file .js-file-line-container:not(.rgh-softwrapped-code)' // Embedded code blocks
	].join());

	for (const table of tables) {
		table.classList.add('rgh-softwrapped-code');

		for (const line of select.all('.blob-code-inner', table)) {
			// All lines may not have `firstChild`, set to `null`
			if (!(line.firstChild && line.firstChild.textContent)) {
				continue;
			}

			const leadingSpaceCharacters = line.firstChild.textContent.match(/^\s+/);
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
			line.style.setProperty('padding-left', `calc((var(--tab-size, 4) * ${tabCount}ch) + ${spaceCount}ch)`, 'important');
			line.style.setProperty('text-indent', `calc((var(--tab-size, 4) * -${tabCount}ch) - ${spaceCount}ch)`, 'important');
		}
	}
}

features.add({
	id: 'indentation-aware-code-wrapping',
	include: [
		features.isPRFiles,
		features.isCommit,
		features.isPRConversation
	],
	load: (async () => {
		init();

		features.onPRFileLoad(init);
		features.onNewComments(init);
	})(),
	init
});
