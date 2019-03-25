/// <reference types="codemirror" />

interface CodeMirrorInstance extends CodeMirror.Editor, CodeMirror.Doc {
}

class Resolver {
	editor: CodeMirrorInstance

	constructor() {
		const codeMirrorElement = document.querySelector('.CodeMirror');
		this.editor = (codeMirrorElement as any).CodeMirror;

		// Listen to swapDoc event in order to find out file change
		this.editor.on('focus', () => {
			const conflicts = document.querySelector('.CodeMirror .rgh-conflict');
			if (conflicts === null) {
				this.processConflicts();
			}
		});
	}

	// Process editor lines and find conflict lines, assign class to each of lines
	// and add resolver widget to the first line of conflict
	processConflicts() {
		const lines = document.querySelectorAll('.CodeMirror .conflict-gutter-marker.js-start');
		for (const line of lines) {
			const lineNumber = Number(line.parentElement.parentElement.textContent) - 1;
			this.addWidgetToLine(lineNumber);
		}
	}

	// Create and add widget to a line
	addWidgetToLine(lineNumber: number) {
		const widget = this.newWidget();
		this.editor.addLineWidget(lineNumber, widget, {above: true});
		// add class for later detection
		this.editor.addLineClass(lineNumber, '', 'rgh-conflict')
	}

	// Create and return conflict resolve widget for specific conflict
	newWidget() {
		const widget = document.createElement('div');
		widget.classList.add('rgh-resolver');
		widget.style.fontWeight = 'bold';

		const link = (branch) => {
			const link = document.createElement('a');
			link.href = `#accept${branch}`;
			link.textContent = `Accept ${branch} Change`;
			link.addEventListener('click', (e: any) => {
				const line = e.target.parentElement.parentElement.parentElement;
				e.preventDefault();
				this.acceptBranch(branch, line);
				
			});
			return link;
		};

		widget.append(
			link('Current'),
			' | ',
			link('Incoming'),
			' | ',
			link('Both')
		);
		return widget;
	}

	// Accept one or both of branches and remove unnecessary lines
	acceptBranch(branch: string, line: Element) {
		let el = line;
		const linesToRemove = [];
		let branchUnderProcess = 'Incoming'
		while(true) {
			const marker = el.querySelector('.conflict-gutter-marker');

			if (!marker) {
				break
			}
			if (marker.classList.contains('js-line')) {
				if (branch === 'Both' || branch === branchUnderProcess) {
					el = el.nextElementSibling;
					continue
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
		this.removeLines(linesToRemove)
	}

	// Remove Lines of a conflict that matchs given selector
	removeLines(lines) {
		// Remove lines in revese order
		lines.reverse();

		for (const line of lines) {
			this.removeline(line);
		}
	}

	// Remove a line
	removeline(lineNumber) {
		this.replaceLine('', lineNumber);
	}

	// Replace line with given text
	replaceLine(newLine, lineNumber) {
		this.editor.replaceRange(newLine, this.pos(lineNumber, 0), this.pos(lineNumber + 1, 0));
	}

	// Create CodeMirror position object
	pos(line: number, index: number) {
		// @ts-ignore
		const {CodeMirror} = window;
		return new CodeMirror.Pos(line, index);
	}
}

new Resolver().processConflicts();
