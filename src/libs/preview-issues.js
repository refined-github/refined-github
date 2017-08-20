import select from 'select-dom';
import {observeEl} from './utils';

const loadingText = 'loading...';

const addToolTip = issueLink => {
	// Has already injected tooltipster
	if (issueLink.classList.contains('tooltipstered')) {
		// Has both tooltip and tooltipster, remove the tooltip to prevent duplicated tooltip
		if (issueLink.classList.contains('tooltipped')) {
			const label = issueLink.getAttribute('aria-label');
			const title = issueLink.getAttribute('title');

			issueLink.classList.remove('tooltipped');
			issueLink.removeAttribute('aria-label');
			if (!title) {
				issueLink.setAttribute('title', label);
			}
		}

		// Skip adding tooltip
		return;
	}

	// Don't add class again to prevent infinite loop
	if (!issueLink.classList.contains('tooltipped')) {
		// Add github original tooltip classes
		issueLink.classList.add('tooltipped', 'tooltipped-se');
	}

	// `title` attribute is loaded asynchronously
	const title = issueLink.getAttribute('aria-label') === loadingText ?
		issueLink.getAttribute('title') :
		issueLink.getAttribute('aria-label');

	if (title) {
		issueLink.setAttribute('aria-label', title);
		issueLink.removeAttribute('title');
	} else {
		// Is loading
		issueLink.setAttribute('aria-label', loadingText);
	}
};

const preview = () => {
	const issueLinks = select.all('.comment .issue-link');

	for (const issueLink of issueLinks) {
		observeEl(issueLink, () => addToolTip(issueLink), {
			attributeFilter: ['title', 'class']
		});
	}
};

export default preview;
