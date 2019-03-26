/// <reference types="codemirror" />

interface CodeMirrorInstance extends CodeMirror.Editor, CodeMirror.Doc {}

const select: typeof document.querySelector = document.querySelector.bind(document);
const editor: CodeMirrorInstance = select<any>('.CodeMirror').CodeMirror;

// Event fired when each file is loaded
editor.on('swapDoc', () => setTimeout(addWidget, 1));

function getLineNumber(lineChild: Element) {
	return Number(
		lineChild
			.closest('.CodeMirror-gutter-wrapper, .CodeMirror-linewidget')
			.parentElement
			.querySelector('.CodeMirror-linenumber')
			.textContent
	) - 1;
}

function appendToLine(line: number, text: string) {
	editor.replaceRange(text, {line, ch: Infinity}); // Infinity = end of line
}

// Create and add widget if not already in the document
function addWidget() {
	if (select('.CodeMirror .rgh-conflict')) {
		return;
	}

	for (const conflict of document.querySelectorAll('.CodeMirror .conflict-gutter-marker.js-start')) {
		const line = getLineNumber(conflict);
		appendToLine(line, ' -- Incoming Change');

		addWidgetToLine(line);
	}

	for (const conflictEnd of document.querySelectorAll('.CodeMirror .conflict-gutter-marker.js-end')) {
		appendToLine(getLineNumber(conflictEnd), ' -- Current Change');
	}

	// Clear editor history, so our change can't be undone
	editor.clearHistory();
}

// Create and add widget to a line
function addWidgetToLine(lineNumber: number) {
	const widget = newWidget();
	editor.addLineWidget(lineNumber, widget, {above: true, noHScroll: true});
	// Add class for later detection
	editor.addLineClass(lineNumber, '', 'rgh-conflict');
}

// Create and return conflict resolve widget for specific conflict
function newWidget() {
	const widget = document.createElement('div');
	widget.classList.add('rgh-resolver');
	widget.style.fontWeight = 'bold';

	const link = (branch, title?: string) => {
		const link = document.createElement('a');
		link.href = `#accept${branch}`;
		link.textContent = title || `Accept ${branch} Change`;
		link.addEventListener('click', (e: any) => {
			e.preventDefault();
			const line = e.target.parentElement.parentElement.parentElement;
			acceptBranch(branch, line);
		});
		return link;
	};

	widget.append(
		link('Current'),
		' | ',
		link('Incoming'),
		' | ',
		link('Both', 'Accept Both Changes')
	);
	return widget;
}

// Accept one or both of branches and remove unnecessary lines
function acceptBranch(branch: string, line: Element) {
	let el = line;
	const linesToRemove = [];
	let branchUnderProcess = 'Incoming';
	while (el !== null) {
		const marker = el.querySelector('.conflict-gutter-marker');

		if (!marker) {
			break;
		}

		if (marker.classList.contains('js-line')) {
			if (branch === 'Both' || branch === branchUnderProcess) {
				el = el.nextElementSibling;
				continue;
			}
		}

		if (marker.classList.contains('js-middle')) {
			branchUnderProcess = 'Current';
		}

		const lineNumberElement = el.querySelector('.CodeMirror-linenumber');
		const lineNumber = Number(lineNumberElement.textContent) - 1;

		linesToRemove.push(lineNumber);

		el = el.nextElementSibling;
	}

	removeLines(linesToRemove);
}

// Remove Lines of a conflict that matchs given selector
function removeLines(lines) {
	// Remove lines in revese order
	lines.reverse();

	for (const line of lines) {
		removeline(line, '+resolve');
	}
}

// Remove a line
function removeline(lineNumber: number, origin?: string) {
	replaceLine('', lineNumber, origin);
}

// Replace line with given text
function replaceLine(newLine: string, line: number, origin?: string) {
	const ch = 0;
	editor.replaceRange(newLine, {ch, line}, {ch, line: line + 1}, origin);
}
