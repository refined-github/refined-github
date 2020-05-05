import select from 'select-dom';
import debounce from 'debounce-fn';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';

let button: HTMLButtonElement | undefined;

const loadMore = debounce(() => {
	button!.click();
	button!.textContent = 'Loading…';

	// If GH hasn't loaded the JS, the click will not load anything.
	// We can detect if it worked by looking at the button's state,
	// and then trying again (auto-debounced)
	if (!button!.disabled) {
		loadMore();
	}
}, {wait: 200});

const inView = new IntersectionObserver(([{isIntersecting}]) => {
	if (isIntersecting) {
		loadMore();
	} else {
		// The button may have been changed after it's gone out of view, so try finding it again
		findButton();
	}
}, {
	rootMargin: '500px' // https://github.com/sindresorhus/refined-github/pull/505#issuecomment-309273098
});

const findButton = (): void => {
	// If the old button is still there, leave
	if (button && document.contains(button)) {
		return;
	}

	// Forget the old button
	inView.disconnect();

	// Watch the new button, or stop everything
	button = select<HTMLButtonElement>('.ajax-pagination-btn')!;
	if (button) {
		inView.observe(button);
	}
};

function init(): void {
	const form = select('.ajax-pagination-form');
	if (form) {
		// If GH hasn't loaded the JS,
		// the fake click will submit the form without ajax.
		form.addEventListener('submit', event => event.preventDefault());

		findButton();
	}
}

features.add({
	id: __filebasename,
	description: 'Automagically expands the newsfeed when you scroll down.',
	screenshot: false
}, {
	include: [
		pageDetect.isDashboard
	],
	onlyAdditionalListeners: true,
	repeatOnAjax: false,
	init
});
