import React from 'dom-chef';
import domify from 'doma';
import select from 'select-dom';
import features from '../libs/features';

const isGist = (link: HTMLAnchorElement): boolean =>
	!link.pathname.includes('.') && // Exclude links to embed files
	(
		link.hostname.startsWith('gist.') ||
		link.pathname.startsWith('gist/')
	);

const isOnlyChild = (link: HTMLAnchorElement): boolean => link.textContent!.trim() === link.parentNode!.textContent!.trim();

async function embedGist(link: HTMLAnchorElement): Promise<void> {
	const info = <em> (loading)</em>;
	link.after(info);

	try {
		const response = await fetch(`${link.href}.json`);
		const gistData = await response.json();

		const files = domify.one(gistData.div)!;
		const fileCount = files.children.length;

		if (fileCount > 1) {
			info.textContent = ` (${fileCount} files)`;
		} else {
			link.parentElement!.attachShadow({mode: 'open'}).append(
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
		info.replaceWith(' (embed failed)');
	}
}

function init(): void {
	select.all<HTMLAnchorElement>('.js-comment-body p a:only-child')
		.filter(item => isGist(item) && isOnlyChild(item))
		.forEach(embedGist);
}

features.add({
	id: 'embed-gist-inline',
	include: [
		features.hasComments
	],
	load: features.onAjaxedPages,
	init
});
