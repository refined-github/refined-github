import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';

function log() {
	console.log('✨', <div className="rgh-jsx-element"/>);
}

function init(): void {
  console.log('init: label-color-picker')
  // if (select.exists('.btn-link')) {
  //   console.log('viento! detectado el boton')
  // }
	// // select('.btn-link')!.addEventListener('click', log);
  // // );
	// // select('.btn-link')!.addEventListener('click', log);
  // select('.btn-link:not(.is-placeholder)')!.after(
  select('.btn-link')!.after(
    <div className='rgh-follower-badge'>Follows you</div>
  );
  console.log(select.all('.js-new-label-color-input'))
  for (const field of select.all('.js-new-label-color-input')) {
    console.log('begin iteration')
    console.log(field)
    field.type = 'color';
    console.log('field type has changed')
    console.log(field)
    console.log('end iteration')
  }
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
