import {h} from 'dom-chef';
import select from 'select-dom';
import {getOwnerAndRepo} from '../libs/page-detect';
import graph from '../libs/graph';
import {calendar, clock} from '../libs/icons';

export default async () => {
	function dateToMDY(date) {
		const strArray = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		const d = date.getDate();
		const m = strArray[date.getMonth()];
		const y = date.getFullYear();
		return `${m} ${(d <= 9 ? '0' + d : d)} , ${y}`;
	}

	const {ownerName, repoName} = getOwnerAndRepo();
	const milestonesObjects = select.all('div.milestone');
	const query = `{
		repository(owner: ${ownerName} , name: ${repoName}) {
			milestones(
				states: CLOSED,
				first: ${milestonesObjects.length}
			) {
				edges {
					node {
						id,
						title,
						number,
						dueOn,
						createdAt
					}
				}
			}
		}
	}`;

	const graphQLResponse = await graph(query);
	const milestones = {};
	for (const milestone of graphQLResponse.repository.milestones.edges) {
		milestones[milestone.node.number] = milestone.node;
	};
	for (const milestones of select.all('.milestone')) {
		const milestoneLink = select.all('.milestone-title-link a', milestone);
		const milestoneClosedDate = select('.milestone-meta-item', milestone);
		const _milestone = milestones[milestoneLink[0].href.split('/').pop()];

		select.all('.milestone-meta', milestone)[0].append(
			<span class="milestone-meta-item">
				<span class="mr-1">{clock()}</span> Created on {dateToMDY(new Date(_milestone.createdAt))}
			</span>
		);
		if (_milestone.dueOn) {
			select.all('.milestone-meta', milestone)[0].append(
				<span class="milestone-meta-item">
					<span class="mr-1">{calendar()}</span> Was due on {dateToMDY(new Date(_milestone.dueOn))}
				</span>
			);
		}
		milestoneClosedDate.classList.add('text-red');
	}
};
