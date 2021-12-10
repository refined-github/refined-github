import React from 'dom-chef';

import {wrapAll} from '../helpers/dom-utils';

// Wrap a list of elements with BtnGroup + ensure each has BtnGroup-item
export const groupButtons = (buttons: Element[]): Element => {
	// Ensure every button has this class
	for (let button of buttons) {
		if (!button.matches('.btn')) {
			button.classList.add('BtnGroup-parent');
			button = button.querySelector('.btn')!;
		}

		button.classList.add('BtnGroup-item');
	}

	// They may already be part of a group
	let group = buttons[0].closest('.BtnGroup');

	// If it doesn't exist, wrap them in a new group
	if (!group) {
		group = <div className="BtnGroup"/>;
		wrapAll(buttons, group);
	}

	return group;
};

// Find immediate `.btn` siblings of `button` and wrap them with groupButtons
export const groupSiblings = (button: Element): Element => {
	const siblings = [button];
	let previous = button.previousElementSibling;
	while (previous?.classList.contains('btn')) {
		siblings.unshift(previous);
		previous = previous.previousElementSibling;
	}

	let next = button.nextElementSibling;
	while (next?.classList.contains('btn')) {
		siblings.push(next);
		next = next.nextElementSibling;
	}

	return groupButtons(siblings);
};
