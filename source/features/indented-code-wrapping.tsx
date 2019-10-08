import './indented-code-wrapping.css';
import select from 'select-dom';
import features from '../libs/features';
import onPrFileLoad from '../libs/on-pr-file-load';
import onNewComments from '../libs/on-new-comments';

function run(): void {
	const tables = select.all([
		'.file table.diff-table:not(.rgh-softwrapped-code)', // Split and unified diffs
		'.file table.d-table:not(.rgh-softwrapped-code)' // "Suggested changes" in PRs
	].join());

	for (const table of tables) {
		table.classList.add('rgh-softwrapped-code');
		const tabSize = parseInt(table.style.getPropertyValue('--tab-size') || document.documentElement.style.getPropertyValue('tab-size'), 10);

		for (const line of select.all('.blob-code-inner:not(.blob-code-hunk)', table)) {
			if (line.textContent!.length < 20) {
				continue;
			}

			const leadingSpaceCharacters = /^\s+/.exec(line.firstChild!.textContent!);
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

			// Code suggestions already had some padding
			const extraPadding = line.classList.contains('px-2') ? '8px + ' : '';

			// If there is mixed indentation on a line, spaces before a tab are collapsed with the following tab until `spaceCount` is more than `tabSize`
			// So, ignore any number of spaces that are below `tabSize` or more than any multiple of `tabSize`
			if (tabCount > 0) {
				if (spaceCount > tabSize) {
					spaceCount %= tabSize;
				} else {
					spaceCount = 0;
				}
			}

			// Move the whole line where it is supposed to be, then unindent the start of the line to compensate for indentation, preserving spaces
			// We might get `--tab-size` from compatible extensions like `github-custom-tab-size`
			line.style.setProperty('padding-left', `calc(${extraPadding}(var(--tab-size, 4) * ${tabCount}ch) + ${spaceCount}ch)`, 'important');
			line.style.setProperty('text-indent', `calc((var(--tab-size, 4) * -${tabCount}ch) - ${spaceCount}ch)`, 'important');
		}
	}
}

function init(): void {
	run();
	onNewComments(run);
	onPrFileLoad(run);

	document.body.classList.add('rgh-code-wrapping-enabled');
}

features.add({
	disabled: '#2421',
	id: __featureName__,
	description: 'Indents wrapped code correctly.',
	screenshot: 'https://user-images.githubusercontent.com/37769974/60379474-0ba67e80-9a51-11e9-97f9-077d282e5bdb.png',
	include: [
		features.isPRFiles,
		features.isCommit,
		features.isPRConversation,
		features.isCompare
	],
	load: features.onAjaxedPages,
	init
});
