import {expect, test} from 'vitest';

import hl from 'highlight.js/lib/common';

import showWhiteSpacesOnLine from './show-whitespace-on-line';

function highlight(html: string): string {
	// Use highlighter to create multiple text nodes
	return hl.highlight(html, {language: 'js'}).value;
}

function serializeDOM(element: Element): string {
	for (const replacement of element.querySelectorAll('[data-rgh-whitespace]')) {
		switch (replacement.getAttribute('data-rgh-whitespace')) {
			case 'space':
				replacement.replaceWith(replacement.innerHTML.replace(/ /g, '•'));
				break;
			case 'tab':
				replacement.replaceWith(replacement.innerHTML.replace(/\t/g, '⟶'));
				break;
			default:
		}
	}

	for (const highlighting of element.querySelectorAll('[class^="hljs"]')) {
		highlighting.replaceWith(highlighting.innerHTML);
	}

	// Compare against the HTML to ensure we're making all the necessary replacements
	return element.innerHTML;
}

function process(html: string): string {
	const element = document.createElement('div');
	element.innerHTML = html;
	return serializeDOM(showWhiteSpacesOnLine(element));
}

function assert(actual: string, expected: string): void {
	expect(process(actual)).toBe(expected);
}

function assertHighlighted(actual: string, expected: string): void {
	expect(process(highlight(actual))).toBe(expected);
}

test('showWhiteSpacesOnLine raw', () => {
	assert(
		'',
		'',
	);
	assert(
		' ',
		'•',
	);
	assert(
		'  ',
		'••',
	);
	assert(
		'	',
		'⟶',
	);
	assert(
		'		',
		'⟶⟶',
	);
	assert(
		'	 ',
		'⟶•',
	);
	assert(
		' 	',
		'•⟶',
	);
	assert(
		' 	 ',
		'•⟶•',
	);
	assert(
		'	 	',
		'⟶•⟶',
	);
	assert(
		' hello ',
		'•hello•',
	);
	assert(
		'	hello	',
		'⟶hello⟶',
	);
	assert(
		'	hello world	',
		'⟶hello•world⟶',
	);
});

test('showWhiteSpacesOnLine real code', () => {
	assert(
		'[1,""]',
		'[1,""]',
	);
	assert(
		'[1,"  "]',
		'[1,"••"]',
	);
	assert(
		'[1, "  "]',
		'[1,•"••"]',
	);
	assert(
		' [1, "  "] ',
		'•[1,•"••"]•',
	);
	assert(
		'  [1, "  "]  ',
		'••[1,•"••"]••',
	);
	assert(
		'[1,""]',
		'[1,""]',
	);
	assert(
		'[1,"		"]',
		'[1,"⟶⟶"]',
	);
	assert(
		'[1,	"		"]',
		'[1,⟶"⟶⟶"]',
	);
	assert(
		'	[1,	"		"]	',
		'⟶[1,⟶"⟶⟶"]⟶',
	);
	assert(
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
