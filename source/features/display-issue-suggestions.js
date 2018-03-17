import select from 'select-dom';
import {h} from 'dom-chef';
import {openIssue, closedIssue} from '../libs/icons';

export default function () {
	const sidebar = select('.discussion-sidebar');
	const issues = [
		{
			title: 'My cat has grown tentacles and turned purple, should I worry?',
			open: false
		},
		{
			title: 'Help, my cat\'s bugging me to install a browser extension!',
			open: true
		}
	];
	sidebar.prepend(
		<div class="discussion-sidebar-item">
			<div class="text-bold mb-2">Possibly related issues</div>
			<div class="Box Box--condensed">
				{
					issues.map(issue => (
						<a class="Box-row d-flex px-2" href="#1321">
							<div class="flex-shrink">{issue.open ? openIssue() : closedIssue()}</div>
							<div class="flex-grow pl-2">{issue.title}</div>
						</a>
					))
				}
			</div>
		</div>
	);
}
