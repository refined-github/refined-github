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
	if (select('.CodeMirror .rgh-resolver')) {
		return;
	}

	for (const conflict of document.querySelectorAll('.CodeMirror .conflict-gutter-marker.js-start')) {
		const line = getLineNumber(conflict);
		appendToLine(line, ' -- Incoming Change');
		editor.addLineWidget(line, newWidget(), {
			above: true,
			noHScroll: true
		});
	}

	for (const conflictEnd of document.querySelectorAll('.CodeMirror .conflict-gutter-marker.js-end')) {
		appendToLine(getLineNumber(conflictEnd), ' -- Current Change');
	}

	// Clear editor history, so our change can't be undone
	editor.clearHistory();
}

function createButton(branch, title?: string) {
	const link = document.createElement('button');
	link.type = 'button';
	link.className = 'btn-link';
	link.textContent = title || `Accept ${branch} Change`;
	link.addEventListener('click', (e: any) => {
		const line = e.target.parentElement.parentElement.parentElement;
		acceptBranch(branch, line);
	});
	return link;
}

// Create and return conflict resolve widget for specific conflict
function newWidget() {
	const widget = document.createElement('div');
	widget.className = 'rgh-resolver';
	widget.style.fontWeight = 'bold';
	widget.append(
		createButton('Current'),
		' | ',
		createButton('Incoming'),
		' | ',
		createButton('Both', 'Accept Both Changes')
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

	for (const line of linesToRemove.reverse()) {
		editor.replaceRange('', {line, ch: 0}, {line: line + 1, ch: 0}, '+resolve');
	}
}
