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

// Delete after Firefox 55 goes stable
// Also update applications.gecko.strict_min_version to 55.0 in manifest.json
const IntersectionObserver = window.IntersectionObserver || class IntersectionObserverLocalfill {
	maybeLoadMore() {
		if (window.innerHeight > btn.getBoundingClientRect().top - 500) {
			loadMore();
		}
	}
	observe() {
		window.addEventListener('scroll', this.maybeLoadMore);
		window.addEventListener('resize', this.maybeLoadMore);
		this.maybeLoadMore();
	}
	disconnect() {
		window.removeEventListener('scroll', this.maybeLoadMore);
		window.removeEventListener('resize', this.maybeLoadMore);
	}
};

const inView = new IntersectionObserver(([{isIntersecting}]) => {
	if (isIntersecting) {
		loadMore();
	}
}, {
	rootMargin: '500px' // https://github.com/sindresorhus/refined-github/pull/505#issuecomment-309273098
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
