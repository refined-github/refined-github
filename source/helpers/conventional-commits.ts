import {assertNodeContent} from './dom-utils.js';

// Using https://www.conventionalcommits.org/ as a reference.
const conventionalCommitRegex = /^(?<type>\w+)(?:\((?<scope>.+)\))?(?<major>!)?: /;

const types = new Map([
	['feat', 'Feature'],
	['fix', 'Fix'],
	['chore', 'Chore'],
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

/**
Remove the raw commit prefix from the single text node.
Note: It does not support pre-formatted titles like: fix(#1 `x`)
*/
export function removeCommitAndScope(textNode: Text | ChildNode): void {
	assertNodeContent(textNode, conventionalCommitRegex);
	textNode.textContent = textNode.textContent.replace(conventionalCommitRegex, '');
}
