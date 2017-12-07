import select from 'select-dom';
import debounce from 'debounce-fn';
import {observeEl} from '../libs/utils';

let btn;
let newsfeedObserver;

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
		newsfeedObserver.disconnect();
	}
};

export default () => {
	const form = select('.ajax-pagination-form');
	if (form) {
		// If GH hasn't loaded the JS,
		// the fake click will submit the form without ajax.
		form.addEventListener('submit', event => event.preventDefault());
		newsfeedObserver = observeEl('#dashboard .news', findButton);
	}
};
