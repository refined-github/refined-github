import select from 'select-dom';
import features from '../libs/features';
import observeEl from '../libs/simplified-element-observer';

function init(): void {
	observeEl(select('.js-milestone-issues-container')!, () => {
		const noPermissionIcons = select.all(
			'[aria-label="You do not have permission to edit this milestone."]'
		);

		noPermissionIcons.forEach(icon => {
			const dragButton = icon.parentElement!;
			dragButton.style.setProperty('display', 'none', 'important');
		});
	});
}

features.add({
	id: 'hide-no-permission-drag',
	include: [features.isMilestone],
	load: features.onAjaxedPages,
	init
});
