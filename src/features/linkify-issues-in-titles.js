import select from 'select-dom';
import linkifyIssues from 'linkify-issues';
import {editTextNodes} from '../libs/linkify-urls-in-code';
import {observeEl} from '../libs/utils';

export default function () {
	observeEl(select('#partial-discussion-header').parentNode, () => {
		const title = select('.js-issue-title:not(.refined-linkified-title)');
		if (title) {
			title.classList.add('refined-linkified-title');
			editTextNodes(linkifyIssues, title);
		}
	});
}
