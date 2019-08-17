import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';

function init(): void {
	const embedMenuItem = select('.select-menu-item')!;
	select('.select-menu-button')!.textContent = 'Embed via <script>';
	select('.select-menu-item-heading', embedMenuItem)!.innerHTML = 'Embed via <code>&lt;script&gt;</code>';
	select('.description', embedMenuItem)!.innerHTML = 'Embed this gist in your website via <code>&lt;script&gt;</code>.';

	const iframe = `<iframe src="https://gist.github.com${location.pathname}.pibb"></iframe>`;
	embedMenuItem.insertAdjacentElement(
		'afterend',
		<button name="button" type="button" className="select-menu-item width-full" aria-checked="false" role="menuitemradio" value={iframe}>
			<svg className="octicon octicon-check select-menu-item-icon" viewBox="0 0 12 16" version="1.1" width="12" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5L12 5z" /></svg>
			<div className="select-menu-item-text">
				<span className="select-menu-item-heading" data-menu-button-text>
					Embed via <code>&lt;iframe&gt;</code>
				</span>
				<span className="description">
					Embed this gist in your website via <code>&lt;iframe&gt;</code>.
				</span>
			</div>
		</button>
	);
}

features.add({
	id: __featureName__,
	description: 'Adds an option to embed gists via <iframe>.',
	screenshot: 'https://user-images.githubusercontent.com/44045911/63209089-320e9f00-c10f-11e9-8878-4afbbff9ee83.png',
	include: [
		features.isGist
	],
	load: features.onDomReady,
	init
});
