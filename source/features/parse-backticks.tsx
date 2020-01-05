import './parse-backticks.css';
import select from 'select-dom';
import features from '../libs/features';
import {parseBackticks} from '../libs/dom-formatters';

function init(): void {
	for (const title of select.all([
		'.commit-title', // `isCommit`
		'.commit-desc', // `isCommit`, `isCommitList`, `isRepoTree`
		'.message', // `isCommitList`, `isRepoTree`
		'.Box--condensed .link-gray[href*="/commit/"]', // `isSingleFile`
		'[aria-label="Issues"][role="group"] .js-navigation-open' // `isDiscussionList`
	])) {
		parseBackticks(title);
	}
}

features.add({
	id: __featureName__,
	description: 'Renders text in `backticks` in issue titles and commit titles/descriptions.',
	screenshot: 'https://user-images.githubusercontent.com/170270/55060505-31179b00-50a4-11e9-99a9-c3691ba38d66.png',
	include: [
		features.isCommit,
		features.isCommitList,
		features.isDiscussionList,
		features.isRepoTree,
		features.isSingleFile
	],
	load: features.onAjaxedPages,
	init
});
