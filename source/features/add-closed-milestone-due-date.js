import {h} from 'dom-chef';
import select from 'select-dom';
import {getOwnerAndRepo} from '../libs/page-detect';
import graph from '../libs/graph';
import {calendar} from '../libs/icons';

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
	if (graphQLResponse && graphQLResponse.repository.milestones.edges.length !== 0) {
		graphQLResponse.repository.milestones.edges.forEach(milestone => {
			milestones[milestone.node.number] = milestone.node;
		});
	}
	milestonesObjects.forEach(milestone => {
		const milestoneLink = select.all('.milestone-title-link a', milestone);
		const milestoneClosedDate = select('.milestone-meta-item', milestone);

		select.all('.milestone-meta', milestone)[0].append(
			<span class="milestone-meta-item">
				<span class="mr-1">{calendar()}</span> Was due on {dateToMDY(new Date(milestones[milestoneLink[0].href.split('/').pop()].dueOn))}
			</span>
		);
		milestoneClosedDate.classList.add('rgh-error-text');
	});
};
