import test, {ExecutionContext} from 'ava';
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
				replacement.replaceWith(replacement.innerHTML.replaceAll(' ', '•'));
				break;
			case 'tab':
				replacement.replaceWith(replacement.innerHTML.replaceAll('\t', '→'));
				break;
			default:
		}
	}

	for (const highlighting of element.querySelectorAll('[class^="hljs"]')) {
		highlighting.replaceWith(highlighting.innerHTML);
	}

	return element.innerHTML;
}

// Enables highlighting/'prettifying when used as html'<div>' or css'.a {})'
// https://prettier.io/blog/2020/08/24/2.1.0.html
function show(
	html: string,
	plainText = true,
): string {
	const element = document.createElement('div');
	element.innerHTML = plainText ? html : highlight(html);

	return serializeDOM(showWhiteSpacesOnLine(element));
}

function assert(t: ExecutionContext, actual: string, expected: string): void {
	t.is(
		show(actual),
		expected,
	);
}

function assertHighlighted(t: ExecutionContext, actual: string, expected: string): void {
	t.is(
		show(actual, false),
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
		'→',
	);
	assert(
		t,
		'		',
		'→→',
	);
	assert(
		t,
		'	 ',
		'→•',
	);
	assert(
		t,
		' 	',
		'•→',
	);
	assert(
		t,
		' 	 ',
		'•→•',
	);
	assert(
		t,
		'	 	',
		'→•→',
	);
	assert(
		t,
		' hello ',
		'•hello•',
	);
	assert(
		t,
		'	hello	',
		'→hello→',
	);
	assert(
		t,
		'	hello world	',
		'→hello•world→',
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
		'[1,"→→"]',
	);
	assert(
		t,
		'[1,	"		"]',
		'[1,→"→→"]',
	);
	assert(
		t,
		'	[1,	"		"]	',
		'→[1,→"→→"]→',
	);
	assert(
		t,
		'		[1,	"		"]		',
		'→→[1,→"→→"]→→',
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
		'[1,•"••"]',
	);
	assertHighlighted(
		t,
		' [1, "  "] ',
		'•[1,•"••"]•',
	);
	assertHighlighted(
		t,
		'  [1, "  "]  ',
		'••[1,•"••"]••',
	);
	assertHighlighted(
		t,
		'[1,""]',
		'[1,""]',
	);
	assertHighlighted(
		t,
		'[1,"		"]',
		'[1,"→→"]',
	);
	assertHighlighted(
		t,
		'[1,	"		"]',
		'[1,→"→→"]',
	);
	assertHighlighted(
		t,
		'	[1,	"		"]	',
		'→[1,→"→→"]→',
	);
	assertHighlighted(
		t,
		'		[1,	"		"]		',
		'→→[1,→"→→"]→→',
	);
});
