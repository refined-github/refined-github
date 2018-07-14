import select from 'select-dom';
import linkifyIssues from 'linkify-issues';
import observeEl from '../libs/simplified-element-observer';
import {editTextNodes} from './linkify-urls-in-code';

export default function () {
	observeEl('#dashboard .news', () => {
		for (const feedEvent of select.all(
			'#dashboard .news .watch_started, #dashboard .news .create, #dashboard .news .push, #dashboard .news .issues_opened',
		)) {
			for (const issue of select.all(
				'blockquote, .f4.text-gray-light.ml-1',
				feedEvent,
			)) {
				editTextNodes(linkifyIssues, issue);
			}
		}
	});
}
