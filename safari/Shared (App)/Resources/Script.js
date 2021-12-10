/* eslint-disable unicorn/filename-case */
/* eslint-env browser */
/* global webkit */

// eslint-disable-next-line no-unused-vars
function show(platform, isEnabled) {
	document.body.classList.add(`platform-${platform}`);

	if (typeof isEnabled === 'boolean') {
		document.body.classList.toggle('state-on', isEnabled);
		document.body.classList.toggle('state-off', !isEnabled);
	} else {
		document.body.classList.remove('state-on');
		document.body.classList.remove('state-off');
	}
}

document.querySelector('.open-preferences').addEventListener('click', () => {
	webkit.messageHandlers.controller.postMessage('open-preferences');
});

document.querySelector('.open-help').addEventListener('click', () => {
	webkit.messageHandlers.controller.postMessage('open-help');
});
