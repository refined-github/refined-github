import hl from 'highlight.js/lib/common';
import test, {ExecutionContext} from 'ava';

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

function assert(t: ExecutionContext, actual: string, expected: string): void {
	t.is(
		process(actual),
		expected,
	);
}

function assertHighlighted(t: ExecutionContext, actual: string, expected: string): void {
	t.is(
		process(highlight(actual)),
		expected,
	);
}

test('showWhiteSpacesOnLine raw', t => {
	assert(
		t,
		'',
		'',
	);
	assert(
		t,
		' ',
		'•',
	);
	assert(
		t,
		'  ',
		'••',
	);
	assert(
		t,
		'	',
		'⟶',
	);
	assert(
		t,
		'		',
		'⟶⟶',
	);
	assert(
		t,
		'	 ',
		'⟶•',
	);
	assert(
		t,
		' 	',
		'•⟶',
	);
	assert(
		t,
		' 	 ',
		'•⟶•',
	);
	assert(
		t,
		'	 	',
		'⟶•⟶',
	);
	assert(
		t,
		' hello ',
		'•hello•',
	);
	assert(
		t,
		'	hello	',
		'⟶hello⟶',
	);
	assert(
		t,
		'	hello world	',
		'⟶hello•world⟶',
	);
});

test('showWhiteSpacesOnLine real code', t => {
	assert(
		t,
		'[1,""]',
		'[1,""]',
	);
	assert(
		t,
		'[1,"  "]',
		'[1,"••"]',
	);
	assert(
		t,
		'[1, "  "]',
		'[1,•"••"]',
	);
	assert(
		t,
		' [1, "  "] ',
		'•[1,•"••"]•',
	);
	assert(
		t,
		'  [1, "  "]  ',
		'••[1,•"••"]••',
	);
	assert(
		t,
		'[1,""]',
		'[1,""]',
	);
	assert(
		t,
		'[1,"		"]',
		'[1,"⟶⟶"]',
	);
	assert(
		t,
		'[1,	"		"]',
		'[1,⟶"⟶⟶"]',
	);
	assert(
		t,
		'	[1,	"		"]	',
		'⟶[1,⟶"⟶⟶"]⟶',
	);
	assert(
		t,
		'		[1,	"		"]		',
		'⟶⟶[1,⟶"⟶⟶"]⟶⟶',
	);
});

test('showWhiteSpacesOnLine highlighted code', t => {
	assertHighlighted(
		t,
		'[1,""]',
		'[1,""]',
	);
	assertHighlighted(
		t,
		'[1,"  "]',
		'[1,"••"]',
	);
	assertHighlighted(
		t,
		'[1, "  "]',
		'[1, "••"]',
	);
	assertHighlighted(
		t,
		' [1, "  "] ',
		'•[1, "••"]•',
	);
	assertHighlighted(
		t,
		'  [1, "  "]  ',
		'••[1, "••"]••',
	);
	assertHighlighted(
		t,
		'[1,""]',
		'[1,""]',
	);
	assertHighlighted(
		t,
		'[1,"		"]',
		'[1,"⟶⟶"]',
	);
	assertHighlighted(
		t,
		'[1,	"		"]',
		'[1,⟶"⟶⟶"]',
	);
	assertHighlighted(
		t,
		'	[1,	"		"]	',
		'⟶[1,⟶"⟶⟶"]⟶',
	);
	assertHighlighted(
		t,
		'		[1,	"		"]		',
		'⟶⟶[1,⟶"⟶⟶"]⟶⟶',
	);
});
