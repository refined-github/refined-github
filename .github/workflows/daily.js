/* eslint-disable unicorn/no-abusive-eslint-disable -- Uses globals */
/* eslint-disable -- Uses globals */
export async function lockAiSpam({github, context, core}) {
	const marker = 'This looks like an AI-generated PR';
	const {owner, repo} = context.repo;

	const from = new Date(Date.now() - 14 * 86_400_000).toISOString().slice(0, 10);
	const to = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);

	const {data} = await github.rest.search.issuesAndPullRequests({
		q: `repo:${owner}/${repo} is:pr is:closed is:unmerged comments:<5 closed:${from}..${to} "${marker}"`,
	});

	await Promise.all(data.items.map(async issue => {
		core.info(issue.title);

		if (issue.author_association !== 'COLLABORATOR') return;

		await github.rest.issues.update({
			owner,
			repo,
			issue_number: issue.number,
			title: 'AI SPAM',
		});

		await github.rest.issues.lock({
			owner,
			repo,
			issue_number: issue.number,
			lock_reason: 'spam',
		});
	}));
}
