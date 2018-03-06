import select from 'select-dom';
import linkifyIssues from 'linkify-issues';
import observeEl from '../libs/simplified-element-observer';
import {editTextNodes} from './linkify-urls-in-code';

export default function () {
	observeEl(select('#partial-discussion-header').parentNode, () => {
		const title = select('.js-issue-title:not(.refined-linkified-title)');
		if (title) {
			title.classList.add('refined-linkified-title');
			editTextNodes(linkifyIssues, title);
		}
	});
}
