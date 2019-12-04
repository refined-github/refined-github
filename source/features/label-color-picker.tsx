import React from 'dom-chef';
import select from 'select-dom';
import delegate, { DelegateEvent } from 'delegate-it';
import features from '../libs/features';
import { func } from 'prop-types';

function log() {
	console.log('✨', <div className="rgh-jsx-element"/>);
}
// FIXME: when color palette changes its value, the text input changes, but the label color don't change

async function labelDelegateEvent(event: DelegateEvent<Event, HTMLButtonElement>): Promise<void> {
  console.log(event.delegateTarget);
  console.log(event.delegateTarget.value);
  console.log(event.delegateTarget.nextElementSibling);
  event.delegateTarget.nextElementSibling.value = event.delegateTarget.value
}

async function colorPaletteDelegateEvent(event: DelegateEvent<Event, HTMLButtonElement>): Promise<void> {
  console.log(event.delegateTarget);
  console.log(event.delegateTarget.value);
  console.log(event.delegateTarget.previousElementSibling);
  event.delegateTarget.previousElementSibling.value = event.delegateTarget.value
}

async function testClickEvent(event: DelegateEvent<Event, HTMLButtonElement>): Promise<void> {
  console.log("CLICK")
  console.log(event.delegateTarget.nextElementSibling.children[0].value)
  event.delegateTarget.nextElementSibling.children[1].value = event.delegateTarget.nextElementSibling.children[0].value
  // debugger
}

function init(): void {
  console.log('init: label-color-picker')
  for (const field of select.all('.js-new-label-color-input')) {
    console.log('original_element: ')
    console.log(field.value)
    const new_element=<input type="color" className={field.className} style={{width:'4em'}} value={field.value} />
    console.log('new element: ')
    console.log(new_element.value)
    field.after(new_element);
  }
  // Here
  // delegate(<selector>, <event type>, <callback to delegate>)
  //select the js-new-label-color-input, set the type as input, add the event to delegate
  delegate('.js-new-label-color', 'click', testClickEvent);
  delegate('.js-new-label-color-input', 'input', labelDelegateEvent);
  //select the js-new-label-color-input + input: CSS, select js-new-label and the input next to it: the color palette
  //, set the type as input, add the event to delegate
  delegate('.js-new-label-color-input + input', 'input', colorPaletteDelegateEvent);
  console.log("Ultimo")
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
	// load: features.onDomReady, // Wait for DOM ready
	// load: features.onAjaxedPages, // Or: Wait for DOM ready AND run on all AJAXed loads
  // load: features.onNewComments, // Or: Wait for DOM ready AND run on all AJAXed loads AND watch for new comments
	load: features.onAjaxedPagesRaw, // Or: Wait for DOM ready AND run on all AJAXed loads
	init
});
