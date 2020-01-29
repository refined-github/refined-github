import React from 'dom-chef';
import select from 'select-dom';
// import delegate, { DelegateSubscription } from 'delegate-it';
import delegate from 'delegate-it';
import features from '../libs/features';

let delegate_temporary: any;
function log() {
	console.log('✨', <div className="rgh-jsx-element"/>);
	console.log('A message log from my brand new feature!!!');
}

function init(): void {
	// Events must be set via delegate, unless shortlived
	delegate_temporary = delegate('.btn', 'click', log);
	console.log('Init Karl the great!!!');
	log();
	const currentQuery = new URLSearchParams(location.search).get('q') ?? select('#js-issues-search').value;
	console.log('Vamos a hacer el for');
	console.log(select.all('a.btn-link'));
	console.log(select.all('open, close'));
	// For (const link of select.all('open, close')) { // This line doesn't work, the only
	for (const link of select.all('a.btn-link')) {
		console.log(link);
		const linkSearchParameters = new URLSearchParams(link.search);
		const linkQuery = linkSearchParameters.get('q');
		if (linkQuery === currentQuery) {
			linkSearchParameters.set('q', linkQuery.replace(/is:open|is:closed/, '').trim());
			link.search = String(linkSearchParameters);
			return; // The next link won't match this condition for sure
		}
	}
}

function deinit(): void {
	delegate_temporary?.destroy();
	delegate_temporary = undefined;
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
