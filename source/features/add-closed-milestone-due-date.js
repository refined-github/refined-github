import {h} from 'dom-chef';
import select from 'select-dom';
import {getOwnerAndRepo} from '../libs/page-detect';
import graph from '../libs/graph';

export default async () => {
	function dateToMDY(date) {
		const strArray = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		const d = date.getDate();
		const m = strArray[date.getMonth()];
		const y = date.getFullYear();
		return `${m} ${(d <= 9 ? '0' + d : d)} , ${y}`;
	}

	const ownerAndRepo = getOwnerAndRepo();
	const milestonesObjects = select.all('div.milestone');
	const query = `{
		repository(owner: ${ownerAndRepo.ownerName} , name: ${ownerAndRepo.repoName}) {
			milestones(
				states: CLOSED,
				first: ${milestonesObjects.length}
			) {
				edges {
					node {
						id,
						title,
						number,
						dueOn
					}
				}
			}
		}
	}`;
	
	const graphQLResponse = await graph(query);
	const milestones = {};
	if (graphQLResponse && graphQLResponse.repository.milestones.edges.length) {
		graphQLResponse.repository.milestones.edges.forEach(milestone => {
			milestones[milestone.node.number] = milestone.node;
		});
	}
	milestonesObjects.forEach((milestone) => {
		const milestoneLink = select.all('.milestone-title-link a', milestone);
		const milestoneClosedDate = select('.milestone-meta-item', milestone);

		select.all('.milestone-meta', milestone)[0].append(
			<span class="milestone-meta-item">
				<span class="mr-1"><svg class="octicon octicon-calendar" viewBox="0 0 14 16" version="1.1" width="14" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M13 2h-1v1.5c0 .28-.22.5-.5.5h-2c-.28 0-.5-.22-.5-.5V2H6v1.5c0 .28-.22.5-.5.5h-2c-.28 0-.5-.22-.5-.5V2H2c-.55 0-1 .45-1 1v11c0 .55.45 1 1 1h11c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm0 12H2V5h11v9zM5 3H4V1h1v2zm6 0h-1V1h1v2zM6 7H5V6h1v1zm2 0H7V6h1v1zm2 0H9V6h1v1zm2 0h-1V6h1v1zM4 9H3V8h1v1zm2 0H5V8h1v1zm2 0H7V8h1v1zm2 0H9V8h1v1zm2 0h-1V8h1v1zm-8 2H3v-1h1v1zm2 0H5v-1h1v1zm2 0H7v-1h1v1zm2 0H9v-1h1v1zm2 0h-1v-1h1v1zm-8 2H3v-1h1v1zm2 0H5v-1h1v1zm2 0H7v-1h1v1zm2 0H9v-1h1v1z"></path></svg></span> Was due on {dateToMDY(new Date(milestones[milestoneLink[0].href.split('/').pop()].dueOn))}
			</span>
		);
		milestoneClosedDate.style.color = '#cb2431';
	});
};
