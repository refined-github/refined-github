/// <reference types="codemirror" />

interface CodeMirrorInstance extends CodeMirror.Editor, CodeMirror.Doc {}

const select: typeof document.querySelector = document.querySelector.bind(document);
const editor: CodeMirrorInstance = select<any>('.CodeMirror').CodeMirror;

// Event fired when each file is loaded
editor.on('swapDoc', () => setTimeout(addWidget, 1));

// Restore widget on undo
editor.on('changes', (_, [firstChange]) => {
	if (firstChange.origin === 'undo' && firstChange.text[0].startsWith('<<<<<<<')) {
		addWidget();
	}
});

function getLineNumber(lineChild: Element) {
	return Number(
		lineChild
			.closest('.CodeMirror-gutter-wrapper, .CodeMirror-linewidget')
			.parentElement
			.querySelector('.CodeMirror-linenumber')
			.textContent
	) - 1;
}

function appendLineInfo(line: number, text: string) {
	// Only append text if it's not already there
	if (!editor.getLine(line).includes(text)) {
		editor.replaceRange(text, {line, ch: Infinity}); // Infinity = end of line
		editor.clearHistory();
	}
}

// Create and add widget if not already in the document
function addWidget() {
	if (select('.CodeMirror .rgh-resolver')) {
		return;
	}

	for (const conflict of document.querySelectorAll('.CodeMirror .conflict-gutter-marker.js-start')) {
		const line = getLineNumber(conflict);
		appendLineInfo(line, ' -- Incoming Change');
		editor.addLineWidget(line, newWidget(), {
			above: true,
			noHScroll: true
		});
	}

	for (const conflictEnd of document.querySelectorAll('.CodeMirror .conflict-gutter-marker.js-end')) {
		appendLineInfo(getLineNumber(conflictEnd), ' -- Current Change');
	}
}

function createButton(branch, title?: string) {
	const link = document.createElement('button');
	link.type = 'button';
	link.className = 'btn-link';
	link.textContent = title || `Accept ${branch} Change`;
	link.addEventListener('click', ({target}) => {
		acceptBranch(branch, getLineNumber(target as Element));
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
function acceptBranch(branch: string, line: number) {
	let deleteNextLine = false;

	const linesToRemove = [];
	editor.eachLine(line, Infinity, lineHandle => {
		// Determine whether to remove the following line(s)
		if (lineHandle.text.startsWith('<<<<<<<')) {
			deleteNextLine = branch === 'Current';
		} else if (lineHandle.text.startsWith('=======')) {
			deleteNextLine = branch === 'Incoming';
		}

		// Delete tracked lines and all conflict markers
		if (deleteNextLine || /^([<=>])\1{6}/.test(lineHandle.text)) {
			linesToRemove.push((lineHandle as any).lineNo());
		}

		if (lineHandle.text.startsWith('>>>>>>>')) {
			return true; // End loop
		}
	});

	for (const line of linesToRemove.reverse()) {
		editor.replaceRange('', {line, ch: 0}, {line: line + 1, ch: 0}, '+resolve');
	}
}
