import {execFileSync} from 'node:child_process';
import {readdirSync, readFileSync, writeFileSync} from 'node:fs';
import process from 'node:process';

type Issue = {
	number: number;
	title: string;
	body: string;
	createdAt: string;
	reactions: {nodes: Array<{createdAt: string}>};
};

const repo = 'refined-github/refined-github';
const yoloPath = 'yolo'; // Checkout of refined-github/yolo
const hour = 3_600_000;
// [upvotes, within this many hours of the issue being opened]
const thresholds = [[5, 24], [10, 48]] as const;

const git = (...parameters: string[]): string =>
	execFileSync('git', [
		'-c',
		'user.name=github-actions[bot]',
		'-c',
		'user.email=41898282+github-actions[bot]@users.noreply.github.com',
		...parameters,
	], {cwd: yoloPath, encoding: 'utf8'});

const features = new Set(
	readdirSync('source/features')
		.filter(name => name.endsWith('.tsx'))
		.map(name => name.slice(0, -'.tsx'.length)),
);

const mentioned = (
	text: string,
): string[] => [...new Set(text.match(/[a-z][\da-z]*(?:-[\da-z]+)*/g)).intersection(features)];

function parseFeatures({title, body}: Issue): string[] {
	const fromTitle = mentioned(title);
	if (fromTitle.length > 0) {
		return fromTitle;
	}

	// The body is only trusted if it points at a single feature
	const fromBody = mentioned(body);
	return fromBody.length === 1 ? fromBody : [];
}

const isHot = ({createdAt, reactions}: Issue): boolean =>
	thresholds.some(([upvotes, hours]) =>
		reactions.nodes.length >= upvotes
		&& Date.parse(reactions.nodes[upvotes - 1].createdAt) - Date.parse(createdAt) <= hours * hour
	);

const since = new Date(Date.now() - (7 * 24 * hour)).toISOString().slice(0, 10);
const response = await fetch('https://api.github.com/graphql', {
	method: 'POST',
	headers: {authorization: `Bearer ${process.env.GITHUB_TOKEN}`},
	body: JSON.stringify({
		query: `query($q: String!) {
			search(query: $q, type: ISSUE, first: 100) {
				nodes {
					... on Issue {
						number title body createdAt
						reactions(content: THUMBS_UP, first: 10, orderBy: {field: CREATED_AT, direction: ASC}) {
							nodes { createdAt }
						}
					}
				}
			}
		}`,
		variables: {q: `repo:${repo} is:issue is:open label:bug created:>=${since}`},
	}),
});
const {data, errors} = await response.json() as {data: {search: {nodes: Issue[]}}; errors?: unknown};
if (errors !== undefined || !response.ok) {
	throw new Error(JSON.stringify(errors ?? response.status));
}

const csvName = 'broken-features.csv';
const csvPath = `${yoloPath}/${csvName}`;
let csv = readFileSync(csvPath, 'utf8').trimEnd();
let added = false;
for (const issue of data.search.nodes) {
	const ids = isHot(issue) ? parseFeatures(issue) : [];
	// Check the history, not the file, so rows removed on purpose stay removed
	if (ids.length === 0 || git('log', '-S', `,${issue.number},`, '--format=%H', '--', csvName).length > 0) {
		continue;
	}

	csv += ids.map(id => `\n${id},${issue.number},`).join('');
	writeFileSync(csvPath, `${csv}\n`);
	git('commit', '-am', `Disable ${ids.map(id => `\`${id}\``).join(', ')} (${repo}#${issue.number})`);
	added = true;
}

if (added) {
	git('push');
}
