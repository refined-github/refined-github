import React from 'dom-chef';
import CodeMirror from 'codemirror';
import features from '../libs/features';

interface Editor extends CodeMirror.Editor, CodeMirror.Doc {
}
interface EditorDOMElement extends HTMLDivElement {
    CodeMirror: Editor
}

function embeddedInit() {
    class Resolver {
        editor : Editor
        conflictNumber = 1
        constructor() {
            const codeMirrorElement: EditorDOMElement = document.querySelector('.CodeMirror')
            this.editor = codeMirrorElement.CodeMirror

            /**
             * listen to swapDoc event in order to find out file change
             */
            this.editor.on('swapDoc', () => {
                // add 200 milisecond delay, we need keep calm until codemirror updates its content
                setTimeout(() => {
                    const conflicts = Array.from(document.querySelectorAll('.CodeMirror .rg-conflict'))
                    if (conflicts.length == 0) {
                        this.processConflicts()
                    }
                }, 200)
            })
        }

        /**
         * Process editor lines and find conflict lines, assign class to each of lines
         * and add resolver widget to the first line of conflict
         */
        processConflicts() {
            const lines = Array.from(document.querySelectorAll('.CodeMirror .conflict-gutter-marker'))
            let stepBranch = '';
            lines.forEach(line => {
                const lineNumber = parseInt(line.parentElement.parentElement.innerText, 10) - 1
                let cl = `rg-conflict c-${this.conflictNumber} `
                if (line.classList.contains('js-start')) {
                    cl += 'rg-separator rg-start incoming-branch current-branch'
                    stepBranch = 'incoming-branch';
                    this.addWidgetToLine(this.conflictNumber, lineNumber)
                }
                if (line.classList.contains('js-middle')) {
                    cl += 'rg-separator rg-middle incoming-branch current-branch'
                    stepBranch = 'current-branch';
                }
                if (line.classList.contains('js-end')) {
                    cl += 'rg-separator rg-end incoming-branch current-branch'
                    stepBranch = '';
                    this.conflictNumber += 1
                }
                if (line.classList.contains('js-line')) {
                    cl += 'rg-middle ' + stepBranch
                }
                this.editor.addLineClass(lineNumber, '', cl)
            })
        }

        /**
         * Create and add widget to a line
         * @param conflictNumber 
         * @param lineNumber 
         */
        addWidgetToLine(conflictNumber: number, lineNumber: number){
            const widget = this.newWidget(conflictNumber);
            this.editor.addLineWidget(lineNumber, widget , { above: true })
        }

        /**
         * Create and return conflict resolve widget for specific conflict
         * @param conflictNumber 
         */
        newWidget(conflictNumber: number) {
            const widget = document.createElement('div')
            widget.classList.add('rg-resolver')
            widget.style.fontWeight = 'bold'
    
            const link = (branch, conflictNumber) => {
                const link = document.createElement('a')
                link.href = `#accept${branch}` 
                link.textContent = `Accept ${branch} Change`
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.acceptBranch(branch, conflictNumber)
                })
                return link;
            }
    
            widget.appendChild(link('Current', conflictNumber))
            widget.appendChild(document.createTextNode(" | "))
            widget.appendChild(link('Incoming', conflictNumber))
            widget.appendChild(document.createTextNode(" | "))
            widget.appendChild(link('Both', conflictNumber))
            return widget;
        }

        /**
         * Accept one or both of branches and remove unnecessary lines
         * @param _branch 
         * @param conflictNumber 
         */
        acceptBranch(_branch: string, conflictNumber: number) {
            const branch = _branch.toLowerCase()
            if (branch === 'both') {
                this.removeLines('.rg-separator', conflictNumber)
            } else if (branch === 'incoming') {
                this.removeLines(`.current-branch`, conflictNumber)
            } else if (branch === 'current') {
                this.removeLines(`.incoming-branch`, conflictNumber)
            }
        }

        /**
         * Remove Lines of a conflict that matchs given selector
         */
        removeLines(selector, conflictNumber) {
            const seps = Array.from(document.querySelectorAll(`.rg-conflict.c-${conflictNumber}${selector}`))

            // remove lines in revese order
            seps.reverse()

            seps.forEach(s => {
                const element = s.querySelector('.CodeMirror-linenumber')
                const lineNumber = parseInt(element.textContent, 10)
                this.removeline(lineNumber - 1)
            })
        }

        /**
         * Remove a line
         * @param lineNumber 
         */
        removeline(lineNumber) {
            this.replaceLine('', lineNumber)
        }

        /**
         * Replace line with given text
         * @param newLine 
         * @param lineNumber 
         */
        replaceLine(newLine, lineNumber) {
            this.editor.replaceRange(newLine,this.pos(lineNumber, 0), this.pos(lineNumber + 1, 0))
        }

        /**
         * Create CodeMirror position object
         * @param line 
         * @param index 
         */
        pos(line: number, index: number) {
            // @ts-ignore
            const CodeMirror = window.CodeMirror;
            return new CodeMirror.Pos(line, index)
        }
    }

    const resolver = new Resolver();
    resolver.processConflicts()
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
