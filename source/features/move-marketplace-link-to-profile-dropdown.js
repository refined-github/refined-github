import {h} from 'dom-chef';
import select from 'select-dom';

export default function () {
	const lastDivider = select.all('.user-nav .dropdown-divider').pop();
	if (!lastDivider) {
		return;
	}
	const marketplaceLink = <a class="dropdown-item" href="/marketplace">Marketplace</a>;
	const divider = <div class="dropdown-divider"></div>;
	lastDivider.before(divider);
	lastDivider.before(marketplaceLink);
}
