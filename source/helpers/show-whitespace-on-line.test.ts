import hl from 'highlight.js';
import {$$} from 'select-dom';
import {assert, test} from 'vitest';

import showWhiteSpacesOnLine from './show-whitespace-on-line.js';

function highlight(html: string): string {
	// Use highlighter to create multiple text nodes
	return hl.highlight(html, {language: 'js'}).value;
}

function serializeDom(element: Element): string {
	for (const replacement of $$('[data-rgh-whitespace]', element)) {
		switch (replacement.getAttribute('data-rgh-whitespace')) {
			case 'space': {
				replacement.replaceWith(replacement.innerHTML.replaceAll(' ', '•'));
				break;
			}

			case 'tab': {
				replacement.replaceWith(replacement.innerHTML.replaceAll('\t', '⟶'));
				break;
			}

			default:
		}
	}

	for (const highlighting of $$('[class^="hljs"]', element)) {
		highlighting.replaceWith(highlighting.innerHTML);
	}

	// Compare against the HTML to ensure we're making all the necessary replacements
	return element.innerHTML;
}

function process(html: string): string {
	const element = document.createElement('div');
	element.innerHTML = html;
	return serializeDom(showWhiteSpacesOnLine(element));
}

function assertProcess(actual: string, expected: string): void {
	assert.equal(process(actual), expected);
}

function assertHighlighted(actual: string, expected: string): void {
	assert.equal(process(highlight(actual)), expected);
}

test('showWhiteSpacesOnLine raw', () => {
	assertProcess(
		'',
		'',
	);
	assertProcess(
		' ',
		'•',
	);
	assertProcess(
		'  ',
		'••',
	);
	assertProcess(
		'	',
		'⟶',
	);
	assertProcess(
		'		',
		'⟶⟶',
	);
	assertProcess(
		'	 ',
		'⟶•',
	);
	assertProcess(
		' 	',
		'•⟶',
	);
	assertProcess(
		' 	 ',
		'•⟶•',
	);
	assertProcess(
		'	 	',
		'⟶•⟶',
	);
	assertProcess(
		' hello ',
		'•hello•',
	);
	assertProcess(
		'	hello	',
		'⟶hello⟶',
	);
	assertProcess(
		'	hello world	',
		'⟶hello•world⟶',
	);
});

test('showWhiteSpacesOnLine real code', () => {
	assertProcess(
		'[1,""]',
		'[1,""]',
	);
	assertProcess(
		'[1,"  "]',
		'[1,"••"]',
	);
	assertProcess(
		'[1, "  "]',
		'[1,•"••"]',
	);
	assertProcess(
		' [1, "  "] ',
		'•[1,•"••"]•',
	);
	assertProcess(
		'  [1, "  "]  ',
		'••[1,•"••"]••',
	);
	assertProcess(
		'[1,""]',
		'[1,""]',
	);
	assertProcess(
		'[1,"		"]',
		'[1,"⟶⟶"]',
	);
	assertProcess(
		'[1,	"		"]',
		'[1,⟶"⟶⟶"]',
	);
	assertProcess(
		'	[1,	"		"]	',
		'⟶[1,⟶"⟶⟶"]⟶',
	);
	assertProcess(
		'		[1,	"		"]		',
		'⟶⟶[1,⟶"⟶⟶"]⟶⟶',
	);
});

test('showWhiteSpacesOnLine highlighted code', () => {
	assertHighlighted(
		'[1,""]',
		'[1,""]',
	);
	assertHighlighted(
		'[1,"  "]',
		'[1,"••"]',
	);
	assertHighlighted(
		'[1, "  "]',
		'[1, "••"]',
	);
	assertHighlighted(
		' [1, "  "] ',
		'•[1, "••"]•',
	);
	assertHighlighted(
		'  [1, "  "]  ',
		'••[1, "••"]••',
	);
	assertHighlighted(
		'[1,""]',
		'[1,""]',
	);
	assertHighlighted(
		'[1,"		"]',
		'[1,"⟶⟶"]',
	);
	assertHighlighted(
		'[1,	"		"]',
		'[1,⟶"⟶⟶"]',
	);
	assertHighlighted(
		'	[1,	"		"]	',
		'⟶[1,⟶"⟶⟶"]⟶',
	);
	assertHighlighted(
		'		[1,	"		"]		',
		'⟶⟶[1,⟶"⟶⟶"]⟶⟶',
	);
});
