import {h} from 'dom-chef';
import select from 'select-dom';
import {getUsername} from '../libs/utils';

export default function () {
	select('.user-nav .dropdown-menu li:nth-child(3)').after(
		<li>
			<a class="dropdown-item" href={`/${getUsername()}?tab=repositories`}>
				Your repositories
			</a>
		</li>
	);
}
