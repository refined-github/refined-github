import {assert, test, vi} from 'vitest';

import {addHotkey, registerHotkeyManually} from './hotkey.js';

function testAddHotkey(existing: string | undefined, added: string, final: string): void {
	const link = document.createElement('a');
	if (existing) {
		link.setAttribute('data-hotkey', existing);
	}

	addHotkey(link, added);
	assert.equal(link.dataset.hotkey, final);
}

test(
	'addHotkey if one is specified',
	testAddHotkey.bind(
		undefined,
		'T-REX',
		'CHICKEN',
		'T-REX,CHICKEN',
	),
);
test(
	'addHotkey if the same is already specified',
	testAddHotkey.bind(
		undefined,
		'CHICKEN',
		'CHICKEN',
		'CHICKEN',
	),
);
test(
	'addHotkey when none are specified',
	testAddHotkey.bind(
		undefined,
		undefined,
		'CHICKEN',
		'CHICKEN',
	),
);

function keyDownEvent(key: string): KeyboardEvent {
	const event = new document.defaultView!.Event('keydown', {bubbles: true, cancelable: true});
	Object.defineProperties(event, {
		key: {value: key},
		altKey: {value: false},
		ctrlKey: {value: false},
		metaKey: {value: false},
	});
	return event as KeyboardEvent;
}

test('registerHotkeyManually triggers on sequence', () => {
	const controller = new AbortController();
	const callback = vi.fn();
	registerHotkeyManually('g u', callback, {signal: controller.signal});

	document.dispatchEvent(keyDownEvent('g'));
	const keydownU = keyDownEvent('u');
	document.dispatchEvent(keydownU);

	assert.equal(callback.mock.calls.length, 1);
	assert.isTrue(keydownU.defaultPrevented);
	controller.abort();
});

test('registerHotkeyManually does not trigger in editable elements', () => {
	const controller = new AbortController();
	const callback = vi.fn();
	registerHotkeyManually('g u', callback, {signal: controller.signal});

	const input = document.createElement('input');
	document.body.append(input);
	input.dispatchEvent(keyDownEvent('g'));
	input.dispatchEvent(keyDownEvent('u'));

	assert.equal(callback.mock.calls.length, 0);
	controller.abort();
	input.remove();
});

test('registerHotkeyManually restarts the sequence when the first key is pressed again', () => {
	const controller = new AbortController();
	const callback = vi.fn();
	registerHotkeyManually('g u', callback, {signal: controller.signal});

	document.dispatchEvent(keyDownEvent('g'));
	document.dispatchEvent(keyDownEvent('g'));
	document.dispatchEvent(keyDownEvent('u'));

	assert.equal(callback.mock.calls.length, 1);
	controller.abort();
});

test('registerHotkeyManually rejects empty sequences', () => {
	assert.throws(
		() => {
			registerHotkeyManually('   ', () => undefined);
		},
		TypeError,
	);
});
