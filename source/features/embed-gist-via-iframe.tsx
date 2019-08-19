import select from 'select-dom';
import features from '../libs/features';

function init(): void {
	const embedViaScript = select('.file-navigation-option .select-menu-item')!;
	const embedViaIframe = embedViaScript.cloneNode(true) as HTMLButtonElement;

	// Modify description to distinguish the two items
	// This is also consistent with the existing "Clone via HTTPS" and "Clone via SSH" items
	const viaScript = 'Embed via <script>';
	select('.file-navigation-option [data-menu-button]')!.textContent = viaScript;
	select('.select-menu-item-heading', embedViaScript)!.textContent = viaScript;
	select('.description', embedViaScript)!.textContent = 'Embed this gist in your website via <script>.';

	// Remove analytics attributes
	embedViaIframe.removeAttribute('data-hydro-click');
	embedViaIframe.removeAttribute('data-hydro-click-hmac');

	// Set required content
	embedViaIframe.setAttribute('aria-checked', 'false');
	embedViaIframe.value = `<iframe src="${location.origin}${location.pathname}.pibb"></iframe>`;
	select('.select-menu-item-heading', embedViaIframe)!.textContent = 'Embed via <iframe>';
	select('.description', embedViaIframe)!.textContent = 'Embed this gist in your website via <iframe>.';

	embedViaScript.after(embedViaIframe);
}

features.add({
	id: __featureName__,
	description: 'Adds a menu item to embed a gist via <iframe>.',
	screenshot: 'https://user-images.githubusercontent.com/44045911/63212711-30f36700-c13b-11e9-945e-3b7946156fa8.png',
	include: [
		features.isGist
	],
	load: features.onDomReady,
	init
});
