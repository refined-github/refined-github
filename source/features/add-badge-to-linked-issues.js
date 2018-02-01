import select from 'select-dom';
import domify from '../libs/domify';

async function fetchStatus(url) {
	const response = await fetch(url, {
		credentials: 'include'
	});
	const dom = domify(await response.text());
	const badge = select('.TableObject-item > .State', dom);

	// Style the badge so it is smaller (like in the timeline)
	badge.classList.add('rgh-issue-badge');
	badge.classList.add('State--small'); // Make the badge smaller
	badge.classList.add('ml-1'); // Add margin left
	badge.classList.add('mr-1'); // Add margin right
	// Shrink the icon by 2px so it matches the little ones that show up in the timeline
	const svg = select('svg', badge);
	svg.setAttribute('width', svg.getAttribute('width') - 2);
	svg.setAttribute('height', svg.getAttribute('height') - 2);
	// // Move the text into an Aria label
	// badge.setAttribute('aria-label', badge.lastChild.textContent);
	// badge.removeChild(badge.lastChild);

	return badge;
}

export default function () {
	for (const issueLink of select.all('.markdown-body a.issue-link')) {
		// Fetch as a Promise instead of async so multiple badges can load
		if (!issueLink.classList.contains('rgh-has-badge')) {
			issueLink.classList.add('rgh-has-badge');
			fetchStatus(issueLink.getAttribute('href')).then(badge => {
				issueLink.parentElement.insertBefore(badge, issueLink);
			});
		}
	}
}
