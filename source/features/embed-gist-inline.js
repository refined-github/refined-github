import {h} from 'dom-chef';
import select from 'select-dom';

const isGist = link =>
	!link.pathname.includes('.') && // Exclude links to embed files
	(
		link.hostname.startsWith('gist.') ||
		link.pathname.startsWith('gist/')
	);

async function embedGist(link) {
	const response = await fetch(`${link.href}.json`);
	const gistData = await response.json();

	link.parentNode.attachShadow({mode: 'open'}).append(
		<style>{`
			.gist .gist-data {
				max-height: 16em;
				overflow-y: auto;
			}
		`}</style>,
		<link rel="stylesheet" href={gistData.stylesheet} />,
		<div dangerouslySetInnerHTML={{__html: gistData.div}} />
	);
}
export default () => {
	select.all('.js-comment-body p a:only-child')
		.filter(isGist)
		.forEach(embedGist);
};
