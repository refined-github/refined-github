import {h} from 'dom-chef';
import select from 'select-dom';
import {getUsername} from '../libs/utils';

export default function () {
	const position = select('.user-nav [aria-label~="profile"] + .dropdown-menu > :nth-child(3)');
	const link = (
		<a class="dropdown-item" href={`/${getUsername()}?tab=repositories`}>
			Your repositories
		</a>
	);

	// GHE doesn't wrap links in <li> yet
	position.after(position.tagName === 'LI' ? <li>{link}</li> : link)
}
