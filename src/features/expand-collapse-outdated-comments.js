import select from 'select-dom';
import {isMac, metaKey} from '../libs/utils';

const keyName = isMac ? 'Alt' : 'Ctrl';

function addTooltip(button) {
	button.setAttribute('aria-label', keyName + ' + click to expand/collapse all outdated comments');
	button.classList.add('tooltipped', 'tooltipped-n');
}

export default () => {
	const showOutdatedButtons = select.all('.show-outdated-button, .hide-outdated-button');
	showOutdatedButtons.forEach(button => {
		addTooltip(button);
		button.addEventListener('click', e => {
			if (e[metaKey]) {
				if (e.target.classList.contains('show-outdated-button')) {
					select.all('.outdated-comment:not(.open) .show-outdated-button').forEach(button => {
						if (button !== e.target) {
							button.click();
						}
					});
				} else {
					select.all('.outdated-comment.open .hide-outdated-button').forEach(button => {
						if (button !== e.target) {
							button.click();
						}
					});
				}
			}
		});
	});
};
