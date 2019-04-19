/// <reference types="codemirror" />

interface CodeMirrorInstance extends CodeMirror.Editor, CodeMirror.Doc {}

// eslint-disable-next-line @typescript-eslint/no-namespace, @typescript-eslint/prefer-namespace-keyword
declare module CodeMirror {
	interface LineHandle {
		widgets: unknown[];
		lineNo(): number;
	}
}

interface EditorLinkedDom extends HTMLElement {
	CodeMirror: CodeMirrorInstance;
}

const select = document.querySelector.bind(document);
const editor = select<EditorLinkedDom>('.CodeMirror')!.CodeMirror;

// Event fired when each file is loaded
editor.on('swapDoc', () => setTimeout(addWidget, 1));

// Restore widget on undo
editor.on('changes', (_, [firstChange]) => {
	if (firstChange.origin === 'undo' && firstChange.text[0].startsWith('<<<<<<<')) {
		addWidget();

		// Reset cursor position to one line instead of multiple
		editor.setCursor(editor.getCursor());
	}
});

function getLineNumber(lineChild: Element) {
	return Number(
		lineChild
			.closest('.CodeMirror-gutter-wrapper, .CodeMirror-linewidget')!
			.parentElement!
			.querySelector('.CodeMirror-linenumber')!
			.textContent
	) - 1;
}

function appendLineInfo(lineHandle: CodeMirror.LineHandle, text: string) {
	// Only append text if it's not already there
	if (!lineHandle.text.includes(text)) {
		const line = lineHandle.lineNo();
		editor.replaceRange(text, {line, ch: Infinity}); // Infinity = end of line
		editor.clearHistory();
	}
}

// Create and add widget if not already in the document
function addWidget() {
	editor.eachLine(lineHandle => {
		if (lineHandle.widgets) {
			return;
		}

		if (lineHandle.text.startsWith('<<<<<<<')) {
			appendLineInfo(lineHandle, ' -- Incoming Change');
			const line = lineHandle.lineNo();
			editor.addLineClass(line, '', 'rgh-resolve-conflicts');
			editor.addLineWidget(line, newWidget(), {
				above: true,
				noHScroll: true
			});
		} else if (lineHandle.text.startsWith('>>>>>>>')) {
			appendLineInfo(lineHandle, ' -- Current Change');
		}
	});
}

function createButton(branch: string, title?: string) {
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

	const linesToRemove: number[] = [];
	editor.eachLine(line, Infinity, lineHandle => {
		// Determine whether to remove the following line(s)
		if (lineHandle.text.startsWith('<<<<<<<')) {
			deleteNextLine = branch === 'Current';
		} else if (lineHandle.text.startsWith('=======')) {
			deleteNextLine = branch === 'Incoming';
		}

		// Delete tracked lines and all conflict markers
		if (deleteNextLine || /^([<=>])\1{6}/.test(lineHandle.text)) {
			linesToRemove.push(lineHandle.lineNo());
		}

		return lineHandle.text.startsWith('>>>>>>>'); // `true` ends loop
	});

	// Delete all lines at once in a performant way
	const ranges = linesToRemove.map(line => ({
		anchor: {line, ch: 0},
		head: {line, ch: 0}
	}));
	editor.setSelections(ranges);
	editor.execCommand('deleteLine');
	editor.setCursor(linesToRemove[0]);
}
