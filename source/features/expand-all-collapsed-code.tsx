import features from '../libs/features';

// Chain clicking on expand buttons by observing mutations of the corresponding .diff-table element
function unfold(): void {
	document.querySelectorAll('.diff-table').forEach(element => {
		function callback(): void {
			const btn: HTMLElement = element.querySelector(
				'.js-expand.directional-expander.single-expander'
			) as HTMLElement;
			if (btn) {
				btn.click();
			}
		}

		const observer = new MutationObserver(callback);
		observer.observe(element, {childList: true, subtree: true});
	});

	document
		.querySelectorAll('.js-expand.directional-expander.single-expander')
		.forEach(element => (element as HTMLElement).click());
}

function init(): void {
	// Add alt-click listener to all new expand button elements that are created when additional file lines are loaded
	document.querySelectorAll('.diff-table').forEach(element => {
		function callback(): void {
			const btns = element.querySelectorAll(
				'.js-expand.directional-expander.single-expander'
			);

			if (btns.length > 0) {
				btns.forEach(btn => {
					btn.addEventListener('click', event => {
						if ((event as MouseEvent).altKey) {
							event.preventDefault();
							unfold();
						}
					});
				});
			}
		}

		const observer = new MutationObserver(callback);
		observer.observe(element, {childList: true, subtree: true});
	});

	// Add alt-click listener to the initial expand buttons
	document
		.querySelectorAll('.js-expand.directional-expander.single-expander')
		.forEach(element => {
			element.addEventListener('click', event => {
				if ((event as MouseEvent).altKey) {
					event.preventDefault();
					unfold();
				}
			});
		});
}

features.add({
	id: __featureName__,
	description: 'Unfolds all files when user alt-clicks on any expand button when viewing PR or commit.',
	screenshot: '',
	include: [features.isPRCommit, features.isSingleCommit],
	load: features.onAjaxedPages,
	init
});
