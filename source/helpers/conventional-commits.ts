import {assertNodeContent} from './dom-utils.js';

// Using https://www.conventionalcommits.org/ as a reference.
const conventionalCommitRegex = /^(?<type>\w+)(?:\((?<scope>.+)\))?: /;

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
	type: string;
	label: string;
	raw: string;
} | undefined {
	const match = conventionalCommitRegex.exec(commitTitle);
	if (!match?.groups?.type) {
		return;
	}

	const {type, scope} = match.groups;
	const cleanType = types.get(type)!;
	if (!cleanType) {
		return;
	}

	return {
		type,
		label: scope ? `${cleanType}: ${scope}` : cleanType,
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
