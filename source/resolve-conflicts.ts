/// <reference types="codemirror" />

interface CodeMirrorInstance extends CodeMirror.Editor, CodeMirror.Doc {
}

let editor: CodeMirrorInstance;
let incomingBranchName: string;
let currentBranchName: string;

function init() {
	const codeMirrorElement = document.querySelector('.CodeMirror');
	editor = (codeMirrorElement as any).CodeMirror;

	incomingBranchName = document.querySelector('.head-ref').textContent;
	currentBranchName = document.querySelector('.base-ref').textContent;

	// Listen to swapDoc event in order to find out file change
	editor.on('focus', () => {
		const conflicts = document.querySelector('.CodeMirror .rgh-conflict');
		if (conflicts === null) {
			processConflicts();
		}
	});
}

// Process editor lines and find conflict lines, assign class to each of lines
// and add resolver widget to the first line of conflict
function processConflicts() {
	const lines = document.querySelectorAll('.CodeMirror .conflict-gutter-marker.js-start');
	for (const line of lines) {
		const lineNumber = Number(line.parentElement.parentElement.textContent) - 1;
		replaceLine(`<<<<<<< ${incomingBranchName} -- Incoming Change\n`, lineNumber);

		addWidgetToLine(lineNumber);
	}

	const endLines = document.querySelectorAll('.CodeMirror .conflict-gutter-marker.js-end');
	for (const line of endLines) {
		const lineNumber = Number(line.parentElement.parentElement.textContent) - 1;
		replaceLine(`>>>>>>> ${currentBranchName} -- Current Change\n`, lineNumber);
	}

	// Clear editor history, so our change can't be undone
	editor.clearHistory();
}

// Create and add widget to a line
function addWidgetToLine(lineNumber: number) {
	const widget = newWidget();
	editor.addLineWidget(lineNumber, widget, {above: true});
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
function replaceLine(newLine: string, lineNumber: number, origin?: string) {
	editor.replaceRange(newLine, pos(lineNumber, 0), pos(lineNumber + 1, 0), origin);
}

// Create CodeMirror position object
function pos(line: number, index: number) {
	// @ts-ignore
	const {CodeMirror} = window;
	return new CodeMirror.Pos(line, index);
}

init();

processConflicts();
