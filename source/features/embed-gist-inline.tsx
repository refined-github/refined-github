import React from 'dom-chef';
import select from 'select-dom';
import domify from '../libs/domify';
import features from '../libs/features';

const isGist = link =>
	!link.pathname.includes('.') && // Exclude links to embed files
	(
		link.hostname.startsWith('gist.') ||
		link.pathname.startsWith('gist/')
	);

const isOnlyChild = link => link.textContent.trim() === link.parentNode.textContent.trim();

async function embedGist(link) {
	const info = <em> (loading)</em>;
	link.after(info);

	try {
		const response = await fetch(`${link.href}.json`);
		const gistData = await response.json();

		const files = domify(gistData.div).firstElementChild;
		const fileCount = files.children.length;

		if (fileCount > 1) {
			info.textContent = ` (${fileCount} files)`;
		} else {
			link.parentNode.attachShadow({mode: 'open'}).append(
				<style>{`
					.gist .gist-data {
						max-height: 16em;
						overflow-y: auto;
					}
				`}</style>,
				<link rel="stylesheet" href={gistData.stylesheet} />,
				files
			);
		}
	} catch {
		info.remove(' (embed failed)');
	}
}

function init() {
	select.all('.js-comment-body p a:only-child')
		.filter(item => isGist(item) && isOnlyChild(item))
		.forEach(embedGist);
}

features.add({
	id: 'embed-gist-inline',
	include: [
		features.isPR,
		features.isIssue
	],
	load: features.onAjaxedPages,
	init
});
