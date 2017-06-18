import select from 'select-dom';
import debounce from 'debounce-fn';
import feedUpdates from './on-feed-update';

let btn;

const loadMore = debounce(() => {
	btn.click();

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
	}
});

const findButton = () => {
	// If the old button is still there, leave
	if (btn && document.contains(btn)) {
		return;
	}

	// Forget the old button
	inView.disconnect();

	// Watch the new button, or stop everything
	btn = select('.ajax-pagination-btn');
	if (btn) {
		inView.observe(btn);
	} else {
		feedUpdates.off(findButton);
	}
};

export default () => {
	const form = select('.ajax-pagination-form');
	if (form) {
		// If GH hasn't loaded the JS,
		// the fake click will submit the form without ajax.
		form.addEventListener('submit', e => e.preventDefault());

		feedUpdates.on(findButton);
		findButton();
	}
};
