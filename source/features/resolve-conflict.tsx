import React from 'dom-chef';
import {Editor, Doc} from 'codemirror';
import features from '../libs/features';

interface CodeMirrorInstance extends Editor, Doc {
}

function embeddedInit() {
	class Resolver {
		editor: CodeMirrorInstance

		conflictNumber = 1

		constructor() {
			const codeMirrorElement = document.querySelector('.CodeMirror');
			this.editor = (codeMirrorElement as any).CodeMirror;

			// Listen to swapDoc event in order to find out file change
			this.editor.on('swapDoc', () => {
				// Add 200 milisecond delay, we need keep calm until codemirror updates its content
				setTimeout(() => {
					const conflicts = document.querySelector('.CodeMirror .rgh-conflict');
					if (conflicts === null) {
						this.processConflicts();
					}
				}, 200);
			});
		}

		// Process editor lines and find conflict lines, assign class to each of lines
		// and add resolver widget to the first line of conflict
		processConflicts() {
			const lines = document.querySelectorAll('.CodeMirror .conflict-gutter-marker');
			let stepBranch = '';
			for (const line of lines) {
				const lineNumber = Number(line.parentElement.parentElement.textContent) - 1;
				let cl = `rgh-conflict c-${this.conflictNumber} `;
				if (line.classList.contains('js-start')) {
					cl += 'rgh-separator rgh-start rgh-incoming-branch rgh-current-branch';
					stepBranch = 'rgh-incoming-branch';
					this.addWidgetToLine(this.conflictNumber, lineNumber);
				} else if (line.classList.contains('js-middle')) {
					cl += 'rgh-separator rgh-middle rgh-incoming-branch rgh-current-branch';
					stepBranch = 'rgh-current-branch';
				} else if (line.classList.contains('js-end')) {
					cl += 'rgh-separator rgh-end rgh-incoming-branch rgh-current-branch';
					stepBranch = '';
					this.conflictNumber += 1;
				} else if (line.classList.contains('js-line')) {
					cl += 'rgh-middle ' + stepBranch;
				}

				this.editor.addLineClass(lineNumber, '', cl);
			}
		}

		// Create and add widget to a line
		addWidgetToLine(conflictNumber: number, lineNumber: number) {
			const widget = this.newWidget(conflictNumber);
			this.editor.addLineWidget(lineNumber, widget, {above: true});
		}

		// Create and return conflict resolve widget for specific conflict
		newWidget(conflictNumber: number) {
			const widget = document.createElement('div');
			widget.classList.add('rgh-resolver');
			widget.style.fontWeight = 'bold';

			const link = (branch, conflictNumber) => {
				const link = document.createElement('a');
				link.href = `#accept${branch}`;
				link.textContent = `Accept ${branch} Change`;
				link.addEventListener('click', e => {
					e.preventDefault();
					this.acceptBranch(branch, conflictNumber);
				});
				return link;
			};

			widget.append(
				link('Current', conflictNumber),
				' | ',
				link('Incoming', conflictNumber),
				' | ',
				link('Both', conflictNumber)
			);
			return widget;
		}

		// Accept one or both of branches and remove unnecessary lines
		acceptBranch(branch: string, conflictNumber: number) {
			if (branch === 'Both') {
				this.removeLines('.rgh-separator', conflictNumber);
			} else if (branch === 'Incoming') {
				this.removeLines('.rgh-current-branch', conflictNumber);
			} else if (branch === 'Current') {
				this.removeLines('.rgh-incoming-branch', conflictNumber);
			}
		}

		// Remove Lines of a conflict that matchs given selector
		removeLines(selector, conflictNumber) {
			const lines = [...document.querySelectorAll(`.rgh-conflict.c-${conflictNumber}${selector}`)];

			// Remove lines in revese order
			lines.reverse();

			for (const line of lines) {
				const element = line.querySelector('.CodeMirror-linenumber');
				const lineNumber = Number(element.textContent);
				this.removeline(lineNumber - 1);
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
}

function init() {
	setTimeout(() => {
		document.head.append(<script>{`(${embeddedInit.toString()})()`}</script>);
	}, 2000);
}

features.add({
	id: 'resolve-conflict',
	include: [
		features.isConflict
	],
	load: features.onAjaxedPages,
	init
});
