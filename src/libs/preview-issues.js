import select from 'select-dom';
import {observeEl} from './utils';

const LOADING_TEXT = 'Loading…';

const addTooltip = (issueLink, title) => {
	issueLink.setAttribute('aria-label', title);
	issueLink.removeAttribute('title');
};

const removeTooltip = issueLink => {
	issueLink.classList.remove('tooltipped', 'tooltipped-se');
	issueLink.removeAttribute('aria-label');
};

const observeTitle = (mutations, observer) => {
	for (const mutation of mutations) {
		const issueLink = mutation.target;
		const title = issueLink.getAttribute('title');

		if (title) {
			addTooltip(issueLink, title);

			observer.disconnect();
		}
	}
};

const observeClass = (mutations, observer) => {
	for (const mutation of mutations) {
		// Already have tooltipstered installed, remove the tooltip
		if (mutation.target.classList.contains('tooltipstered')) {
			removeTooltip(mutation.target);

			observer.disconnect();
		}
	}
};

const preview = () => {
	const issueLinks = select.all('.comment .issue-link');

	for (const issueLink of issueLinks) {
		// Add the original tooltip classes
		issueLink.classList.add('tooltipped', 'tooltipped-se');
		issueLink.setAttribute('aria-label', LOADING_TEXT);

		observeEl(issueLink, observeTitle, {
			attributeFilter: ['title']
		});
		observeEl(issueLink, observeClass, {
			attributeFilter: ['class']
		});
	}
};

export default preview;
