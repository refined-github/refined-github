import {h} from 'dom-chef';
import select from 'select-dom';
import {getUsername} from '../libs/utils';

export default function () {
	const query = encodeURIComponent(`reviewed-by:${getUsername()}`);

	const reviewedByYou = select(`.select-menu-list a[href*="${query}"]`);
	if (!reviewedByYou) {
		return;
	}

	const href = reviewedByYou.href.replace(query, `-${query}`);
	const notReviewedByYou =
		<a href={href} class="select-menu-item js-navigation-item">
			<svg
				class="octicon octicon-check select-menu-item-icon"
				viewBox="0 0 12 16"
				version="1.1"
				width="12"
				height="16"
				aria-hidden="true">
				<path fill-rule="evenodd" d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5L12 5z" />
			</svg>
			<div class="select-menu-item-text">Not reviewed by you</div>
		</a>;

	// When the query includes the "not reviewed by you" filter, the "reviewd by you" item will be selected
	// because of this we remove the selected class and add it to the correct item.
	if (location.search.includes(`-${query}`)) {
		reviewedByYou.classList.remove('selected');
		notReviewedByYou.classList.add('selected');
	}

	reviewedByYou.after(notReviewedByYou);
}
