import OptionsSync from 'webext-options-sync';

new OptionsSync().syncForm('#options-form');

/**
 * GitHub Enterprise support
 */
const cdForm = document.querySelector('#custom-domain');
const cdInput = document.querySelector('#custom-domain-origin');

cdForm.addEventListener('submit', event => {
	event.preventDefault();

	const origin = new URL(cdInput.value).origin;

	if (origin) {
		chrome.permissions.request({
			origins: [
				`${origin}/*`
			]
		}, granted => {
			if (granted) {
				cdForm.reset();
			}
		});
	}
});
