import select from 'select-dom';
import delegate from 'delegate';

function addTooltips() {
	for (const button of select.all('.show-outdated-button, .hide-outdated-button')) {
		button.setAttribute('aria-label', 'Alt + click to expand/collapse all outdated comments');
		button.classList.add('rgh-tooltipped', 'tooltipped', 'tooltipped-n');
	}
}

function handleClick(event) {
	if (event.altKey) {
		const clickedButton = event.target;
		const viewportOffset = clickedButton.parentNode.getBoundingClientRect().top;

		let buttons;
		if (clickedButton.classList.contains('show-outdated-button')) {
			buttons = select.all('.outdated-comment:not(.open) .show-outdated-button');
		} else {
			buttons = select.all('.outdated-comment.open .hide-outdated-button');
		}

		for (const button of buttons) {
			if (button !== clickedButton) {
				button.click();
			}
		}

		// Scroll to original position where the click occurred after the rendering of all click events is done
		requestAnimationFrame(() => {
			const newOffset = clickedButton.parentNode.getBoundingClientRect().top;
			window.scrollBy(0, newOffset - viewportOffset);
		});
	}
}

export default function () {
	delegate('.js-discussion', '.show-outdated-button, .hide-outdated-button', 'click', handleClick);
	addTooltips();
}
