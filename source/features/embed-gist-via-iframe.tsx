import select from 'select-dom';
import onetime from 'onetime';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';

function init(): void {
	const embedViaScript = select('.file-navigation-option button[value^="<script"]')!;
	const embedViaIframe = embedViaScript.cloneNode(true);

	// Remove analytics attributes
	delete embedViaIframe.dataset.hydroClick;
	delete embedViaIframe.dataset.hydroClickHmac;

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

void features.add(import.meta.url, {
	include: [
		pageDetect.isSingleGist,
	],
	awaitDomReady: true, // TODO: Don't awaitDomReady
	init: onetime(init),
});
