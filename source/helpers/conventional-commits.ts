// Using https://www.conventionalcommits.org/ as a reference.
export const conventionalCommitRegex = /^(?<type>\w+)(?:\((?<scope>.+)\))?(?<major>!)?: /;

const types = new Map([
	['feat', 'Feature'],
	['fix', 'Fix'],
	['chore', 'Chore'],
	['revert', 'Revert'],
	['style', 'Style'],
	['docs', 'Docs'],
	['build', 'Build'],
	['refactor', 'Refactor'],
	['test', 'Test'],
	['ci', 'CI'],
	['perf', 'Performance'],
	['meta', 'Meta'],
]);

export function parseConventionalCommit(commitTitle: string): {
	rawType: string;
	type: string;
	scope?: string;
	raw: string;
} | undefined {
	const match = conventionalCommitRegex.exec(commitTitle);
	if (!match?.groups?.type) {
		return;
	}

	const {type: rawType, scope, major} = match.groups;
	const type = types.get(rawType);
	if (!type) {
		return;
	}

	return {
		rawType,
		type: major ? `${type}!` : type,
		scope: scope ? `${scope}: ` : undefined,
		raw: match[0],
	};
}
