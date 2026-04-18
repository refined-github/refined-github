// Using https://www.conventionalcommits.org/ as a reference.
export const conventionalCommitRegex = /^(?<type>\w+)(?:\((?<scope>.+?)\))?(?<major>!)?: */;

// Do not send PRs for types not listed here: https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional#rules
// No more types will be added nor do we accept options.
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
	const type = types.get(rawType.toLowerCase());
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
