import {h} from 'dom-chef';
import select from 'select-dom';

const isGist = link =>
	!link.pathname.includes('.') && // Exclude links to embed files
	(
		link.hostname.startsWith('gist.') ||
		link.pathname.startsWith('gist/')
	);

const createGistElement = gistData => (
	<div>
		<link rel="stylesheet" href={gistData.stylesheet} />
		<div dangerouslySetInnerHTML={{__html: gistData.div}} />
	</div>
);

async function embedGist(link) {
	const response = await fetch(`${link.href}.json`);
	const gistData = await response.json();
	const gistEl = createGistElement(gistData);
	const shadowDom = link.parentNode.attachShadow({mode: 'open'});
	shadowDom.append(gistEl);
	shadowDom.append(<style>{'.gist .gist-data {max-height: 16em}'}</style>);
}
export default () => {
	select.all('.js-comment-body p a:only-child')
		.filter(isGist)
		.forEach(embedGist);
};
