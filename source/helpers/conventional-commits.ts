import zipTextNodes from 'zip-text-nodes';

// Using https://www.conventionalcommits.org/ as a reference.
const CONVENTIONAL_COMMIT_REGEX = /^(?<type>\w+)(?:\((?<scope>.+)\))?: /;

export function parseConventionalCommit(commitTitle: string): RegExpExecArray | undefined {
	return CONVENTIONAL_COMMIT_REGEX.exec(commitTitle) ?? undefined;
}

export function removeCommitAndScope(
	element: HTMLElement,
	match: RegExpExecArray,
): void {
	const {type, scope} = match?.groups ?? {};

	const semanticCommitTypeAndScope = scope ? `${type}(${scope}):` : `${type}:`;

	const modified = element.textContent.replace(semanticCommitTypeAndScope, match => `<s>${match}</s>`);

	const temporaryDiv = document.createElement('div');
	temporaryDiv.innerHTML = modified;

	zipTextNodes(element, temporaryDiv);

	element.querySelector('s')!.remove();
}
