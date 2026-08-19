/* eslint-disable unicorn/no-abusive-eslint-disable -- Uses globals */
/* eslint-disable -- Uses globals */
export async function blockAi({github, context, core}) {
	const marker = "This looks like an AI-generated PR, so we're preemptively closing it.";

	const pr = context.payload.pull_request;
	const {owner, repo} = context.repo;

	const {data: comments} = await github.rest.issues.listComments({
		owner,
		repo,
		issue_number: pr.number,
		per_page: 5,
	});

	const alreadyProcessed = comments.some(
		comment =>
			comment.user?.type === 'Bot'
			&& comment.body?.startsWith(marker),
	);

	if (alreadyProcessed) {
		core.info(`PR #${pr.number} was already processed; skipping.`);
		return;
	}

	const isAi = pr.title.startsWith('AI:')
		|| /npx|build:bundle|build:typescript|Verification|Validation|Summary|Changes|Testing|—/.test(pr.body ?? '');

	if (!isAi) {
		core.info(`PR #${pr.number} did not match the AI detection rules.`);
		return;
	}

	await github.rest.pulls.update({
		owner,
		repo,
		pull_number: pr.number,
		state: 'closed',
	});

	await github.rest.issues.createComment({
		owner,
		repo,
		issue_number: pr.number,
		body:
			`${marker} If you're human and tested it, include a screenshot/video/gif of the working PR and we can reopen the PR. Don't open more PRs until this one is resolved.`,
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
