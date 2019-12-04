import React from 'dom-chef';
import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import features from '../libs/features';
// FIXME: whenever color palette changes its value, the label color example above the edit form doesn't change it's value
// FIXME: whenever the Save Changes button is pressed, if the web page is not reloaded and the "Edit" link is
//        pressed again, when the new edit form will be prompted, the colorPalette would not appear.

async function labelDelegateEvent(event: DelegateEvent<Event, HTMLButtonElement>): Promise<void> {
	event.delegateTarget.nextElementSibling.value = event.delegateTarget.value;
}

async function colorPaletteDelegateEvent(event: DelegateEvent<Event, HTMLButtonElement>): Promise<void> {
	event.delegateTarget.previousElementSibling.value = event.delegateTarget.value;
	event.delegateTarget.parentElement.previousElementSibling.style.backgroundColor = event.delegateTarget.value;
}

async function testClickEvent(event: DelegateEvent<Event, HTMLButtonElement>): Promise<void> {
	event.delegateTarget.nextElementSibling.children[1].value = event.delegateTarget.nextElementSibling.children[0].value;
}

function init(): void {
	for (const field of select.all('.js-new-label-color-input')) {
		const new_element = <input type="color" className={field.className} style={{width: '4em'}} value={field.value} />;
		field.after(new_element);
	}

	delegate('.js-new-label-color', 'click', testClickEvent);
	delegate('.js-new-label-color-input', 'input', labelDelegateEvent);
	delegate('.js-new-label-color-input + input', 'input', colorPaletteDelegateEvent);
}

features.add({
	id: __featureName__,
	description: 'Simplify the GitHub interface and adds useful features',
	screenshot: 'https://user-images.githubusercontent.com/1402241/58238638-3cbcd080-7d7a-11e9-80f6-be6c0520cfed.jpg',
	shortcuts: { // This only adds the shortcut to the help screen, it doesn't enable it
		'↑': 'Edit your last comment'
	},
	include: [
		features.isRepo
	],
	exclude: [
		features.isOwnUserProfile
	],
	load: features.onAjaxedPages, // Or: Wait for DOM ready AND run on all AJAXed loads
	init
});
