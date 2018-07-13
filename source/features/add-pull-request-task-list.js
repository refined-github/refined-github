import {h} from 'dom-chef';
import select from 'select-dom';
import {check} from '../libs/icons';

const storageKey = 'cachedLists';

const getCachedTasksList = async () => {
	const keys = await browser.storage.local.get({
		[storageKey]: {}
	});
	return keys[storageKey];
};

export default async () => {
	const pullRequestNumber = select('.gh-header-number').textContent;
	const cache = await getCachedTasksList() || {};

	function hashCode(s) {
		return s.split('').reduce((a, b) => {
			a = ((a << 5) - a) + b.charCodeAt(0);
			return a & a;
		}, 0);
	}

	select.all('.js-timeline-item .discussion-item-body').forEach(discussion => {
		select.all('.js-comment-container:not(.outdated-comment)', discussion).forEach((fileReview, fileIndex) => {
			const taskID = `gh-${pullRequestNumber.replace('#', '')}-${fileIndex}-${hashCode(select('.file-header a', fileReview).href)}`;
			fileReview.setAttribute('id', taskID);
			if (cache[taskID]) {
				fileReview.classList.add('rgh-taskList-completed');
			}

			const _markTask = event => {
				event.stopPropagation();
				const targetElement = event.target || event.srcElement;
				const taskElement = select(`#${targetElement.getAttribute('data-taskID')}`);
				// Check if the task has been done to see if we want to mark it as done or not
				if (cache[taskID]) {
					taskElement.classList.remove('rgh-taskList-completed');
					delete cache[taskID];
				} else {
					taskElement.classList.add('rgh-taskList-completed');
					cache[taskID] = true;
				}
				browser.storage.local.set({[storageKey]: cache});
			};

			const markTask = check();
			// Prepare the mark task element with the appropriate attributes
			markTask.classList.add('rgh-taskAction');
			const taskHeader = select('.file-header', fileReview);
			taskHeader.classList.add('rgh-pr-comments-file-header');
			// Attach the mark and expand tasks element to the header
			taskHeader.append(<span class="rgh-taskList-action rgh-markTask" data-taskID={taskID} onClick={_markTask}>{markTask}</span>);
		});
	});
};
