import {h} from 'dom-chef';
import select from 'select-dom';
import * as icons from '../libs/icons';
import {getUsername} from '../libs/utils';

export default function () {
	const query = encodeURIComponent(`reviewed-by:${getUsername()}`);

	const reviewedByYou = select(`.select-menu-list a[href*="${query}"]`);
	if (!reviewedByYou) {
		return;
	}

	const href = reviewedByYou.href.replace(query, `-${query}`);
	const notReviewedByYou = (
		<a href={href} class="select-menu-item js-navigation-item">
			<span class="select-menu-item-icon">{icons.check()}</span>
			<div class="select-menu-item-text">Not reviewed by you</div>
		</a>
	);

	// When the query includes the "not reviewed by you" filter, the "reviewd by you" item will be selected
	// because of this we remove the selected class and add it to the correct item.
	if (location.search.includes(`-${query}`)) {
		reviewedByYou.classList.remove('selected');
		notReviewedByYou.classList.add('selected');
	}

	reviewedByYou.after(notReviewedByYou);
}
