import select from 'select-dom';
import delegate from 'delegate-it';
import * as api from '../libs/api';
import features from '../libs/features';
import {getOwnerAndRepo, getDiscussionNumber, getOP} from '../libs/utils';

interface Author {
	email: string;
	name: string; // Used when the commit isn't linked to a GitHub user
	user: {
		name: string;
		login: string;
	};
}

let coAuthors: Author[];

async function fetchCoAuthoredData(): Promise<Author[]> {
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
									name
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

	return userInfo.repository.pullRequest.commits.nodes.map((node: AnyObject) => node.commit.author as Author);
}

function addCoAuthors(): void {
	const field = select<HTMLTextAreaElement>('#merge_message_field')!;
	if (field.value.includes('Co-authored-by: ')) {
		// Don't affect existing information
		return;
	}

	const addendum = new Map();
	for (const {email, user, name} of coAuthors) {
		if (user) {
			addendum.set(user.login, `Co-authored-by: ${user.name} <${email}>`);
		} else {
			addendum.set(name, `Co-authored-by: ${name} <${email}>`);
		}
	}

	addendum.delete(getOP());

	field.value += '\n\n' + [...addendum.values()].join('\n');
}

async function init(): Promise<void> {
	coAuthors = await fetchCoAuthoredData();

	delegate('.discussion-timeline-actions', '.merge-message [type=button]', 'click', addCoAuthors);
}

features.add({
	id: 'add-co-authored-by',
	include: [
		features.isPRConversation
	],
	load: features.onAjaxedPages,
	init
});
