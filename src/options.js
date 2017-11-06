import browser from 'webextension-polyfill';
import OptionsSync from 'webext-options-sync';

new OptionsSync().syncForm('#options-form');

/**
 * GitHub Enterprise support
 */
const cdForm = document.querySelector('#custom-domain');
const cdInput = document.querySelector('#custom-domain-origin');

cdForm.addEventListener('submit', async event => {
	event.preventDefault();

	const origin = new URL(cdInput.value).origin;

	if (origin) {
		const granted = await browser.permissions.request({
			origins: [
				`${origin}/*`
			]
		});
		if (granted) {
			cdForm.reset();
		}
	}
});
