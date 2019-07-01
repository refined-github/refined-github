import select from 'select-dom';
import debounce from 'debounce-fn';
import features from '../libs/features';
import observeEl from '../libs/simplified-element-observer';

let btn: HTMLButtonElement;

const loadMore = debounce(() => {
	btn.click();
	btn.textContent = 'Loading...';

	// If GH hasn't loaded the JS, the click will not load anything.
	// We can detect if it worked by looking at the button's state,
	// and then trying again (auto-debounced)
	if (!btn.disabled) {
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
	if (btn && document.contains(btn)) {
		return;
	}

	// Forget the old button
	inView.disconnect();

	// Watch the new button, or stop everything
	btn = select<HTMLButtonElement>('.ajax-pagination-btn')!;
	if (btn) {
		inView.observe(btn);
	}
};

function init(): void {
	const form = select('.ajax-pagination-form');
	if (form) {
		// If GH hasn't loaded the JS,
		// the fake click will submit the form without ajax.
		form.addEventListener('submit', event => event.preventDefault());

		observeEl('#dashboard .news', findButton);
	}
}

features.add({
	id: __featureName__,
	description: 'Add infinite scrolling to the dashboard news feed',
	include: [
		features.isDashboard
	],
	load: features.onDomReady,
	init
});
