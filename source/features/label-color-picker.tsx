import features from '../libs/features';

import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';

function log() {
	console.log('✨', <div className="rgh-jsx-element"/>);
}

/*
function init () {
	console.log('My first contribution');
}
*/

function init(): void {
	select('.btn')!.addEventListener('click', log);
}
function deinit(): void {
	select('.btn')!.removeEventListener('load', log);
}

features.add({
	id: __featureName__,
	description: 'Simplify the GitHub interface and adds useful features',
	screenshot: 'https://user-images.githubusercontent.com/1402241/58238638-3cbcd080-7d7a-11e9-80f6-be6c0520cfed.jpg',
	shortcuts: { // This only adds the shortcut to the help screen, it doesn't enable it
		'↑': 'Edit your last comment'
	},
	include: [
		features.isUserProfile,
		features.isRepo
	],
	exclude: [
		features.isOwnUserProfile
	],
	load: features.onDomReady, // Wait for DOM ready
	// load: features.onAjaxedPages, // Or: Wait for DOM ready AND run on all AJAXed loads
	// load: features.onNewComments, // Or: Wait for DOM ready AND run on all AJAXed loads AND watch for new comments
	deinit, // Rarely needed
	init
});
/*
features.add({
	id: __featureName__,
	description: 'Adds a color picker for labels',
	screenshot: '',
	init
});
*/