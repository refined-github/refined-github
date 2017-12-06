import select from 'select-dom';

const isGist = link => link.hostname.startsWith('gist.') || link.pathname.startsWith('gist/');

const getJsonUrl = href => `${href}.json`.replace(/\.(js|json)\.json$/, '.json');
const getGistData = async href => {
	const response = await fetch(getJsonUrl(href));
	return response.json();
};

const createGistElement = gistData => (
	<div>
		<link rel="stylesheet" href={gistData.stylesheet} />
		<div dangerouslySetInnerHTML={{__html: gistData.div}} />
	</div>
);

export default async () => {
	const gistLinks = select.all('.js-comment-body p a:only-child').filter(isGist);

	for (const link of gistLinks) {
		try {
			const gistData = await getGistData(link.href);
			const gistEl = createGistElement(gistData);
			const linkParent = link.parentNode;
			linkParent.parentNode.replaceChild(gistEl, linkParent);
		} catch (err) {}
	}
};
