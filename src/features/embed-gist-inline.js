import select from 'select-dom';

const gistRegex = /gist\.github\.com\/\w*?\/\w*/;
const isGist = link => gistRegex.test(link.href);

const getJsonUrl = href => `${href}.json`.replace(/\.jso?n?\.json$/, '.json');
const getGistData = href => fetch(getJsonUrl(href)).then(response => response.json());

const createGistElement = gistData => {
	const el = document.createElement('div');
	const style = `<link rel="stylesheet" href="${gistData.stylesheet}">`;
	el.innerHTML = style + gistData.div;
	return el;
};

export default async () => {
	const gistLinks = select
		.all('.js-comment-body p a[href^="https://gist.github.com"]:only-child')
		.filter(isGist);

	for (let link of gistLinks) {
		try {
			const gistData = await getGistData(link.href);
			const gistEl = createGistElement(gistData);
			const linkParent = link.parentNode;
			linkParent.parentNode.replaceChild(gistEl, linkParent);
		} catch (err) {}
	}
};
