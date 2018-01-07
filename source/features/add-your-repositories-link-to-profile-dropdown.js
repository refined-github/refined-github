import {h} from 'dom-chef';
import select from 'select-dom';
import {getUsername} from '../libs/utils';

export default function () {
	const userName = getUsername();

	const yourProfileItem = select.all(`.user-nav .dropdown-menu .dropdown-item[href="/${userName}"]`).pop().parentNode;

	if (!yourProfileItem) {
		return;
	}
	const yourRepoItem = <li><a class="dropdown-item" href={`/${userName}?tab=repositories`}>Your repositories</a></li>;
	yourProfileItem.after(yourRepoItem);
}
