import {h} from 'dom-chef';
import select from 'select-dom';
import {getUsername} from '../libs/utils';

export default function () {
	const ghMenuItem = select('.user-nav .dropdown-menu li:nth-child(3)');
	if (ghMenuItem) {
		ghMenuItem.after(
			<li>
				<a class="dropdown-item" href={`/${getUsername()}?tab=repositories`}>
					Your repositories
				</a>
			</li>
		);
	} else {
		// GHE does not have the li wrapper currently
		select('.user-nav .dropdown-menu a:nth-child(3)').after(
			<a class="dropdown-item" href={`/${getUsername()}?tab=repositories`}>
				Your repositories
			</a>
		);
	}
}
