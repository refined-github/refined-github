import select from 'select-dom';

function addTooltip(button) {
	button.setAttribute('aria-label', 'Alt + click to expand/collapse all outdated comments');
	button.classList.add('tooltipped', 'tooltipped-n');
}

export default () => {
	const showOutdatedButtons = select.all('.show-outdated-button, .hide-outdated-button');
	showOutdatedButtons.forEach(button => {
		addTooltip(button);
		button.addEventListener('click', e => {
			if (e.altKey) {
				const parentElement = e.target.parentNode;
				const viewportOffset = parentElement.getBoundingClientRect().top;
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
				// Scroll to original position where the click occurred after the rendering of all click events is done
				requestAnimationFrame(() => {
					const offsetTop = $(parentElement).offset().top - viewportOffset;
					window.scroll(0, offsetTop);
				});
			}
		});
	});
};
