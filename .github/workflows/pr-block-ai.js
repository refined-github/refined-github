export async function run({github, context, core}) {
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
		title: 'AI SPAM',
	});

	await github.rest.issues.createComment({
		owner,
		repo,
		issue_number: pr.number,
		body:
			`${marker} If you're human and tested it, include a screenshot/video/gif of the working PR and we can reopen the PR. Don't open more PRs until this one is resolved.`,
	});
}
