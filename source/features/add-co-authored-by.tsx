import select from 'select-dom';
import * as api from '../libs/api';
import features from '../libs/features';
import {getDiscussionNumber, getOP, getRepoGQL} from '../libs/utils';
import onPrMergePanelOpen from '../libs/on-pr-merge-panel-open';

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
	const userInfo = await api.v4(`
		repository(${getRepoGQL()}) {
			pullRequest(number: ${getDiscussionNumber()}) {
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
	`);

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

	if (addendum.size > 0) {
		field.value += '\n\n' + [...addendum.values()].join('\n');
	}
}

async function init(): Promise<void> {
	coAuthors = await fetchCoAuthoredData();

	onPrMergePanelOpen(addCoAuthors);
}

features.add({
	id: __featureName__,
	description: 'Adds `co-authored-by` to the commit when merging PRs with multiple committers.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/51468821-71a42100-1da2-11e9-86aa-fc2a6a29da84.png',
	include: [
		features.isPRConversation
	],
	load: features.onAjaxedPages,
	init
});
