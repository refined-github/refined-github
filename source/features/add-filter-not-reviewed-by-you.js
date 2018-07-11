import {h} from 'dom-chef';
import select from 'select-dom';
import * as icons from '../libs/icons';
import {getUsername} from '../libs/utils';

export default function () {
	const username = getUsername();
	const reviewdQuery = encodeURIComponent(`reviewed-by:${username}`);

	const reviewedElement = select(`.select-menu-list a[href*="${reviewdQuery}"]`);
	if (!reviewedElement) {
		return;
	}

	// PRs authored by the user count as not reviewed by the user so we also need to filter the author
	const notReviewedQuery = encodeURIComponent(`-reviewed-by:${username} -author:${username}`);
	const notReviewedHref = reviewedElement.href.replace(reviewdQuery, notReviewedQuery);
	const notReviewedElement = (
		<a href={notReviewedHref} class="select-menu-item js-navigation-item">
			<span class="select-menu-item-icon">{icons.check()}</span>
			<div class="select-menu-item-text">Not reviewed by you</div>
		</a>
	);

	// When the query includes the "not reviewed by you" filter, the "reviewed by you" item will be selected.
	// Because of this we remove the selected class and add it to the correct item.
	if (location.search.includes(notReviewedQuery)) {
		reviewedElement.classList.remove('selected');
		notReviewedElement.classList.add('selected');
	}

	reviewedElement.after(notReviewedElement);
}
