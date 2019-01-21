import select from 'select-dom';
import delegate from 'delegate';
import * as api from '../libs/api';
import features from '../libs/features';
import {getOwnerAndRepo, getDiscussionNumber} from '../libs/utils';
import {getOP} from './op-labels';

let coAuthors;

async function fetchCoAuthoredData() {
	const prNumber = getDiscussionNumber();
	const {ownerName, repoName} = getOwnerAndRepo();

	const userInfo = await api.v4(
		`{
			repository(owner: "${ownerName}", name: "${repoName}") {
				pullRequest(number: ${prNumber}) {
					commits(first: 100) {
						nodes {
							commit {
								author {
									email
									user {
										login
										name
									}
								}
							}
						}
					}
				}
			}
		}`
	);

	return userInfo.repository.pullRequest.commits.nodes.map(node => node.commit.author);
}

function addCoAuthors() {
	const field = select('#merge_message_field');
	if (field.value.includes('Co-authored-by: ')) {
		// Don't affect existing information
		return;
	}

	const addendum = new Map();
	for (const {email, user} of coAuthors) {
		addendum.set(user.login, `Co-authored-by: ${user.name} <${email}>`);
	}

	addendum.delete(getOP());

	field.value += '\n\n' + [...addendum.values()].join('\n');
}

async function init() {
	coAuthors = await fetchCoAuthoredData();

	delegate('.discussion-timeline-actions', '.merge-message [type=submit]', 'click', addCoAuthors);
}

features.add({
	id: 'add-co-authored-by',
	include: [
		features.isPRConversation
	],
	load: features.onAjaxedPages,
	init
});
