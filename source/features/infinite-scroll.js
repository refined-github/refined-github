/*
This feature adds infinite scrolling to:
- News feed on the Dashboard
- Contribution activities in a user profile
*/

import select from 'select-dom';
import debounce from 'debounce-fn';
import observeEl from '../libs/simplified-element-observer';
import {isDashboard, isUserProfile} from '../libs/page-detect';

let btn;

const loadMore = debounce(() => {
	btn.click();
	btn.textContent = 'loading...';

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
	}
};

export default () => {
	const form = select('.ajax-pagination-form');
	if (form) {
		// If GH hasn't loaded the JS,
		// the fake click will submit the form without ajax.
		form.addEventListener('submit', event => event.preventDefault());

		if (isDashboard()) {
			observeEl('#dashboard .news', findButton);
		} else if (isUserProfile()) {
			observeEl('#js-contribution-activity', findButton);
		}
	}
};
