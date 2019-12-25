import './parse-backticks.css';
import select from 'select-dom';
import features from '../libs/features';
import {parseBackticks} from '../libs/dom-formatters';

function init(): void {
	for (const title of select.all(`
		[aria-label="Issues"][role="group"] .js-navigation-open,
		.message,
		.commit-title,
		.commit-desc,
		.Box--condensed .link-gray[href*="/commit/"]
	`)) {
		parseBackticks(title);
	}
}

features.add({
	id: __featureName__,
	description: 'Renders text in `backticks` in issue titles and commit titles/descriptions.',
	screenshot: 'https://user-images.githubusercontent.com/170270/55060505-31179b00-50a4-11e9-99a9-c3691ba38d66.png',
	include: [
		// Issue/PR list: "[aria-label="Issues"][role="group"] .js-navigation-open" selector
		features.isDiscussionList,

		// Repository start page:
		// - Preview of latest commit: ".message" and ".commit-desc" selectors
		// - Commit messages in file tree: ".message" selector
		features.isRepoTree,

		// Commit list: ".message" and ".commit-desc" selectors
		features.isCommitList,

		// Single commit view: ".commit-title" and ".commit-desc" selectors
		features.isCommit,

		// Single file view: '.Box--condensed .link-gray[href*="/commit/"]' selector
		features.isSingleFile
	],
	load: features.onAjaxedPages,
	init
});
