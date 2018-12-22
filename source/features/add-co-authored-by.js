import {h} from 'dom-chef';
import select from 'select-dom';
import * as api from '../libs/api';
import {escapeForGql} from '../libs/utils';
import {getOwnerAndRepo, getDiscussionNumber} from '../libs/page-detect';

const coAuthorData = {};

async function fetchCoAuthoredData() {
	const {ownerName, repoName} = getOwnerAndRepo();
	const prNumber = getDiscussionNumber();

	if (!ownerName || !repoName || !prNumber) {
		return;
	}

	let apiResponse;
	try {
		apiResponse = await api.v4(
			`{
				repository(owner: "${ownerName}", name: "${repoName}") {
					pullRequest(number: ${prNumber}) {
						commits(first: 100) {
							nodes {
								commit {
									author {
										email
										user {
											databaseId
											login
											name
											email
										}
									}
								}
							}
						}
						reviews(first: 100) {
							nodes {
								author {
									login
								}
							}
						}
						comments(first: 100) {
							nodes {
								author {
									login
								}
							}
						}
					}
				}
			}`
		);
	} catch (error) {
		disableCoAuthorButton(error);
		return;
	}
	const {data: contributorData, errors} = apiResponse;

	if (errors && errors[0].message.includes('the following scopes: [\'user:email\', \'read:user\']')) {
		disableCoAuthorButton('To add co-authors, please add the "user:email" to your personal token.');
		return;
	}

	coAuthorData.userData = new Map();
	coAuthorData.committers = new Set();

	for (const commit of contributorData.repository.pullRequest.commits.nodes) {
		const {email, user} = commit.commit.author;

		coAuthorData.committers.add(user.login);

		// If the commit had an email address attached, prefer that over the user email.
		if (email) {
			user.email = email;
		}
		coAuthorData.userData.set(user.login, user);
	}

	coAuthorData.reviewers = new Set();

	for (const review of contributorData.repository.pullRequest.reviews.nodes) {
		const {login} = review.author;

		// Only store reviewers that aren't committers.
		if (!coAuthorData.committers.has(login)) {
			coAuthorData.reviewers.add(login);
		}
	}

	coAuthorData.commenters = new Set();

	for (const comment of contributorData.repository.pullRequest.comments.nodes) {
		const {login} = comment.author;

		// Only store commenters that aren't committers or reviewers.
		if (!coAuthorData.committers.has(login) && !coAuthorData.reviewers.has(login)) {
			coAuthorData.commenters.add(login);
		}
	}

	// We already have user info for committers, we need to grab it for everyone else.
	const {data: userData} = await api.v4(
		'{' +
			[...coAuthorData.reviewers, ...coAuthorData.commenters].map(user =>
				escapeForGql(user) + `: user(login: "${user}") {databaseId, login, name, email}`
			) +
		'}'
	);

	for (const user of Object.values(userData)) {
		coAuthorData.userData.set(user.login, user);
	}
}

function disableCoAuthorButton(error) {
	const coAuthorButton = select('.rgh-coauthor-button');
	if (!coAuthorButton) {
		return;
	}

	coAuthorButton.disabled = true;
	coAuthorButton.title = error;
}

function addCoAuthoredBy(groups = ['committers']) {
	if (coAuthorData.userData.size === 0) {
		return;
	}

	const coAuthors = groups.map(group => {
		// Skip an empty set of contributors.
		if (coAuthorData[group].size === 0) {
			return false;
		}

		// Generate each Co-authored-by entry, and join them into a single string.
		return [...coAuthorData[group]].map(username => {
			const {name, databaseId, email} = coAuthorData.userData.get(username);
			const commitEmail = email || `${databaseId}+${username}@users.noreply.github.com`;
			return `Co-authored-by: ${name} <${commitEmail}>`;
		}).join('\n');
	}).filter(el => el).join('\n');

	const messageEl = select('#merge_message_field');
	const message = messageEl.value.replace(/^Co-authored-by:[\s\S]*/m, '').trim();
	messageEl.value = message + '\n\n' + coAuthors;
}

function toggleAllContributors({target}) {
	if (target.disabled) {
		return;
	}

	if (target.dataset.addAll === 'true') {
		addCoAuthoredBy(['committers', 'reviewers', 'commenters']);
		target.textContent = 'Remove Extra Co-Authors';
		target.dataset.addAll = 'false';
	} else {
		addCoAuthoredBy(['committers']);
		target.textContent = 'Add All Co-Authors';
		target.dataset.addAll = 'true';
	}
}

export default function () {
	const btn = select('.merge-message .btn-group-squash [type=submit]');
	if (!btn) {
		return;
	}

	fetchCoAuthoredData();

	btn.addEventListener('click', () => addCoAuthoredBy(['committers']));

	const buttonGroup = select('.commit-form-actions .select-menu');

	if (!buttonGroup) {
		return;
	}

	// Insert our button before the Cancel button
	buttonGroup.lastElementChild.before(
		' ',
		<button type="button" class="btn rgh-coauthor-button" onclick={toggleAllContributors} data-add-all={true}>
			Add All Co-Authors
		</button>
	);
}
