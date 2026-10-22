/* eslint-disable unicorn/no-abusive-eslint-disable -- Uses globals */
/* eslint-disable -- Uses globals */
export async function blockAi({github, context, core}) {
	const marker = 'This looks like an AI-generated PR';
	const templateMarker = 'The description of this PR is the unmodified template';

	const pr = context.payload.pull_request;
	const {owner, repo} = context.repo;

	if (pr.user?.login === 'fregante') {
		core.info(`PR #${pr.number} was opened by a maintainer; skipping.`);
		return;
	}

	const {data: comments} = await github.rest.issues.listComments({
		owner,
		repo,
		issue_number: pr.number,
		per_page: 5,
	});

	const alreadyProcessed = comments.some(
		comment =>
			comment.user?.type === 'Bot'
			&& (comment.body?.includes(marker) || comment.body?.includes(templateMarker)),
	);

	if (alreadyProcessed) {
		core.info(`PR #${pr.number} was already processed; skipping.`);
		return;
	}

	const isEmptyTemplate = /## Test URLs\s+## Screenshots?$/i.test(pr.body?.trim() ?? '');
	const isAi = pr.title.startsWith('AI:')
		|| /npx|build:bundle|build:typescript|Verification|Validation|Summary|Changes|Testing|—/.test(pr.body ?? '');

	if (!isAi && !isEmptyTemplate) {
		core.info(`PR #${pr.number} did not match the AI detection rules.`);
		return;
	}

	await github.rest.pulls.update({
		owner,
		repo,
		pull_number: pr.number,
		state: 'closed',
	});

	if (isEmptyTemplate) {
		await github.rest.issues.createComment({
			owner,
			repo,
			issue_number: pr.number,
			body: [
				`**Please follow the PR template.** ${templateMarker}, with no test URLs or screenshots.`,
				'',
				'Next steps:',
				'1. Read the template and the Contributing page linked in it.',
				'2. Update the PR body with real URLs where you tested the change, and a screenshot/video/gif of it working.',
				'3. Wait for a human to review the PR and reopen it.',
				'',
				'Tips:',
				'- **Do not open more PRs** until this one is reopened and merged.',
				"- Don't waste your time on PRs that ignore the template, they won't be accepted.",
			].join('\n'),
		});
		return;
	}

	await github.rest.issues.createComment({
		owner,
		repo,
		issue_number: pr.number,
		body: [
			`**All PRs must include screenshots showing the changes or fixes.** ${marker}, "tests pass" is not an excuse.`,
			'',
			'Next steps:',
			'1. Update the PR body with a screenshot/video/gif of the working PR.',
			'2. Wait for a human to review the PR and reopen it.',
			'',
			'Tips:',
			'- **Do not open more PRs** until this one is reopened and merged.',
			"- Don't waste your tokens on junk PRs that won't be accepted.",
			"- Don't waste your tokens on junk comments that nobody reads.",
		].join('\n'),
	});
}

export async function inheritLabels({github, context, core}) {
	const allowed = ['bug', 'enhancement', 'meta'];
	const {owner, repo} = context.repo;
	const pr = context.payload.pull_request;

	const query = `
		query($owner:String!, $repo:String!, $number:Int!) {
			repository(owner:$owner, name:$repo) {
				pullRequest(number:$number) {
					closingIssuesReferences(first: 10) {
						nodes {
							labels(first: 20) {
								nodes { name }
							}
						}
					}
				}
			}
		}
	`;

	const res = await github.graphql(query, {
		owner,
		repo,
		number: pr.number,
	});

	const labels = new Set();

	if (/^(?:Meta:|Bump|Update|Lint)|rgh-/.test(pr.title)) {
		labels.add('meta');
	}

	if (/restore feature/i.test(pr.title)) {
		labels.add('bug');
	}

	for (
		const issue of res.repository.pullRequest.closingIssuesReferences.nodes
	) {
		for (const label of issue.labels.nodes) {
			if (allowed.includes(label.name)) {
				labels.add(label.name);
			}
		}
	}

	if (labels.size > 0) {
		await github.rest.issues.addLabels({
			owner,
			repo,
			issue_number: pr.number,
			labels: [...labels],
		});
	}
}
