import select from 'select-dom';
import features from '../libs/features';

function init(): void {
	if (!isGistValid()) {
		return;
	}

	const embedViaScript = select('.file-navigation-option [value^="<script"]')!;
	const embedViaIframe = embedViaScript.cloneNode(true) as HTMLButtonElement;

	// Remove analytics attributes
	embedViaIframe.removeAttribute('data-hydro-click');
	embedViaIframe.removeAttribute('data-hydro-click-hmac');

	// Set required content
	embedViaIframe.setAttribute('aria-checked', 'false');
	embedViaIframe.value = `<iframe src="${location.origin}${location.pathname}.pibb"></iframe>`;
	select('.select-menu-item-heading', embedViaIframe)!.textContent = 'Embed via <iframe>';
	select('.description', embedViaIframe)!.textContent = 'Embed this gist in your website via <iframe>.';

	// Modify description of the original embed type to distinguish the two items
	select('.select-menu-item-heading', embedViaScript)!.textContent = 'Embed via <script>';
	select('.description', embedViaScript)!.textContent = 'Embed this gist in your website via <script>.';

	embedViaScript.after(embedViaIframe);
}

features.add({
	id: __featureName__,
	description: 'Adds a menu item to embed a gist via <iframe>.',
	screenshot: 'https://user-images.githubusercontent.com/44045911/63633382-6a1b6200-c67a-11e9-9038-aedd62e4f6a8.png',
	include: [
		features.isGist
	],
	load: features.onDomReady,
	init
});

// Checks if a single gist is open
function isGistValid(): boolean {
	if (/.?\/gist\.github\.com\/.+\/[a-zA-Z\d]+/.test(window.location.href)) {
		return true;
	}
	
	return false;
}
