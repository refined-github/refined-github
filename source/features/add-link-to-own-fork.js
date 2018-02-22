import {h} from 'dom-chef';
import select from 'select-dom';
import { getCurrentRepoDetails, getUsername } from '../libs/utils';
import api from '../libs/api';

export default async () => {
	const user = getUsername();
	const currentRepo = getCurrentRepoDetails().join('/');
	const apiPath = `repos/${currentRepo}/forks`;
	const header = select('h1.public');
	const loaderNode = header.appendChild(
		<span class="fork-flag forked-to-flag">Checking for forks...</span>
	);

	const forksList = await api(apiPath);

	const forkDetails = getForkedRepoDetails(user, forksList);
	if (!forkDetails) return;

	loaderNode.parentElement
		.replaceChild(
			<span class="fork-flag forked-to-flag">
				<span class="text">Forked to </span>
				<a href={forkDetails.html_url}>{ forkDetails.full_name }</a>
			</span>,
			loaderNode
		);
}

function getForkedRepoDetails(ownerName, forksList) {
	return forksList.find(f => f.owner.login === ownerName) || null;
}
