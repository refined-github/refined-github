import select from 'select-dom';
import * as api from '../libs/api';
import {escapeForGql} from '../libs/utils';
import {getOwnerAndRepo, getPRNumber} from '../libs/page-detect';

const coAuthorData = {};

async function fetchCoAuthoredData() {
	const {ownerName, repoName} = getOwnerAndRepo();
	const prNumber = getPRNumber();

	if (!ownerName || !repoName || !prNumber) {
		return;
	}

	const {data: contributorData} = await api.v4(
		`{
			repository(owner: "${ownerName}", name: "${repoName}") {
				pullRequest(number: ${prNumber}) {
					commits(first: 100) {
						nodes {
							commit {
								author {
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

	coAuthorData.userData = [];
	coAuthorData.committers = new Set();

	for (const commit of contributorData.repository.pullRequest.commits.nodes) {
		coAuthorData.committers.add(commit.commit.author.user.login);
		coAuthorData.userData[commit.commit.author.user.login] = commit.commit.author.user;
	}

	coAuthorData.reviewers = new Set();

	for (const review of contributorData.repository.pullRequest.reviews.nodes) {
		// Only store reviewers that aren't committers.
		if (!coAuthorData.committers.has(review.author.login)) {
			coAuthorData.reviewers.add(review.author.login);
		}
	}

	coAuthorData.commenters = new Set();

	for (const comment of contributorData.repository.pullRequest.comments.nodes) {
		// Only store commenters that aren't committers or reviewers.
		if (!coAuthorData.committers.has(comment.author.login) && !coAuthorData.reviewers.has(comment.author.login)) {
			coAuthorData.commenters.add(comment.author.login);
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

	Object.values(userData).forEach(user => {
		coAuthorData.userData[user.login] = user;
	});
}

async function addCoAuthoredBy() {
	const priorities = ['committers', 'reviewers', 'commenters'];

	const coAuthors = priorities.map(priority => {
		// Skip an empty set of contributors.
		if (coAuthorData[priority].size === 0) {
			return [];
		}

		// Add a header for each section.
		const header = '# ' + priority.replace(/^./, char => char.toUpperCase()) + '\n';

		// Generate each Co-authored-by entry, and join them into a single string.
		return header + [...coAuthorData[priority]].map(username => {
			const {name, databaseId, email} = coAuthorData.userData[username];
			const commitEmail = email || `${databaseId}+${username}@users.noreply.github.com`;
			return `Co-authored-by: ${name} <${commitEmail}>`;
		}).join('\n');
	}).join('\n');

	select('#merge_message_field').value += '\n\n' + coAuthors;
}

export default function () {
	const btn = select('.merge-message .btn-group-squash [type=submit]');
	if (!btn) {
		return;
	}

	fetchCoAuthoredData();

	btn.addEventListener('click', addCoAuthoredBy);
}
