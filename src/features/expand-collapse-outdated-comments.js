import select from 'select-dom';

function addTooltip(button) {
	button.setAttribute('aria-label', 'Alt + click to expand/collapse all outdated comments');
	button.classList.add('rgh-tooltipped', 'tooltipped', 'tooltipped-n');
}

function handleClick(event) {
	if (event.altKey) {
		const parentElement = event.target.parentNode;
		const viewportOffset = parentElement.getBoundingClientRect().top;

		let buttons;
		if (event.target.classList.contains('show-outdated-button')) {
			buttons = select.all('.outdated-comment:not(.open) .show-outdated-button');
		} else {
			buttons = select.all('.outdated-comment.open .hide-outdated-button');
		}

		for (const button of buttons) {
			if (button !== event.target) {
				button.click();
			}
		}

		// Scroll to original position where the click occurred after the rendering of all click events is done
		requestAnimationFrame(() => {
			const newOffset = parentElement.getBoundingClientRect().top;
			window.scrollBy(0, newOffset - viewportOffset);
		});
	}
}

export default function () {
	$('.js-discussion').on('click', '.show-outdated-button, .hide-outdated-button', handleClick);

	for (const button of select.all('.show-outdated-button, .hide-outdated-button')) {
		addTooltip(button);
	}
}
