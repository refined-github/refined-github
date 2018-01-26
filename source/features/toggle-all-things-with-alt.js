import select from 'select-dom';
import delegate from 'delegate';

// Handles two parts:
// - Getting buttons of the same feature
// - Getting buttons of items in the same state
// Notes:
// - Comments and files both use .js-details-target, but
// - Outdated comments have two .js-details-target's so it's easier to select them specifically
function getSimilarButtons(button) {
	// Toggle comment in PR Conversation
	if (button.matches('.show-outdated-button')) {
		return select.all('.outdated-comment:not(.open) .show-outdated-button');
	}
	if (button.matches('.hide-outdated-button')) {
		return select.all('.outdated-comment.open .hide-outdated-button');
	}

	// Toggle file in PR Files
	if (button.closest('.file.Details--on')) {
		return select.all('.file.Details--on .js-details-target');
	}
	if (button.closest('.file:not(.Details--on)')) {
		return select.all('.file:not(.Details--on) .js-details-target');
	}
}

function addTooltips() {
	for (const button of select.all('.outdated-comment .js-details-target, .file .js-details-target')) {
		button.setAttribute('aria-label', 'Alt + click to expand/collapse all');
		button.classList.add('rgh-tooltipped', 'tooltipped', 'tooltipped-w');
	}
}

function handleClick(event) {
	if (event.altKey) {
		const clickedButton = event.delegateTarget;
		const viewportOffset = clickedButton.parentNode.getBoundingClientRect().top;
		const buttons = getSimilarButtons(clickedButton);
		if (!buttons || buttons.length === 0) {
			return;
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
	delegate('.repository-content', '.js-details-target', 'click', handleClick);
	addTooltips();
}
