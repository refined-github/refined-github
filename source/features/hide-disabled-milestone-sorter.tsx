import select from 'select-dom';
import features from '../libs/features';
import observeEl from '../libs/simplified-element-observer';

function hide(): void {
	for (const icon of select.all('[aria-label="You do not have permission to edit this milestone."]')) {
		icon.parentElement!.remove();
	}
}

function init(): void {
	observeEl('.js-milestone-issues-container', hide);
}

features.add({
	id: 'hide-disabled-milestone-sorter',
	description: 'Hide the milestone drag icon when you don’t have permission to sort the milestones',
	include: [
		features.isMilestone
	],
	load: features.onAjaxedPages,
	init
});
