import select from 'select-dom';
import linkifyIssues from 'linkify-issues';
import observeEl from '../libs/simplified-element-observer';
import {editTextNodes} from './linkify-urls-in-code';

export default function () {
	observeEl('#dashboard .news', () => {
		const feedEvents = select.all(
			'#dashboard .news .watch_started, #dashboard .news .create, #dashboard .news .push, #dashboard .news .issues_opened',
		);
		for (const feedEvent of feedEvents) {
			const issues = select.all('blockquote, .f4.text-gray-light.ml-1', feedEvent);
			for (const issue of issues) {
				editTextNodes(linkifyIssues, issue);
			}
		}
	});
}
