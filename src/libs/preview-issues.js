import {observeEl} from './utils';

const loadingText = 'loading...';

const addToolTip = issueLink => {
	issueLink.classList.add('tooltipped', 'tooltipped-se');

	const title = issueLink.getAttribute('aria-label') === loadingText ?
		issueLink.getAttribute('title') :
		issueLink.getAttribute('aria-label');

	if (title) {
		issueLink.setAttribute('aria-label', title);
		issueLink.removeAttribute('title');
	} else {
		issueLink.setAttribute('aria-label', loadingText);
	}
};

const preview = () => {
	const issueLinks = Array.from(document.querySelectorAll('.comment .issue-link'));

	issueLinks.forEach(issueLink => {
		observeEl(issueLink, () => addToolTip(issueLink), {
			attributeFilter: ['title']
		});
	});
};

export default preview;
