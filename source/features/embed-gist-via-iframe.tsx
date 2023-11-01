import {$} from 'select-dom';
import onetime from 'onetime';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

async function init(): Promise<void> {
	const embedViaScript = await elementReady('.file-navigation-option button[value^="<script"]');
	const embedViaIframe = embedViaScript!.cloneNode(true);

	// Remove analytics attributes
	delete embedViaIframe.dataset.hydroClick;
	delete embedViaIframe.dataset.hydroClickHmac;

	// Set required content
	embedViaIframe.setAttribute('aria-checked', 'false');
	embedViaIframe.value = `<iframe src="${location.origin}${location.pathname}.pibb"></iframe>`;
	$('.select-menu-item-heading', embedViaIframe)!.textContent = 'Embed via <iframe>';
	$('.description', embedViaIframe)!.textContent = 'Embed this gist in your website via <iframe>.';

	// Modify description of the original embed type to distinguish the two items
	$('.select-menu-item-heading', embedViaScript)!.textContent = 'Embed via <script>';
	$('.description', embedViaScript)!.textContent = 'Embed this gist in your website via <script>.';

	embedViaScript!.after(embedViaIframe);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isSingleGist,
	],
	init: onetime(init),
});

/*

Test URLs:

https://gist.github.com/fregante/5b239118cd2aaf001b0d33d54166cd95

*/
