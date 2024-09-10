import zipTextNodes from 'zip-text-nodes';

// Using https://www.conventionalcommits.org/ as a reference.

export function getConventionalCommitAndScopeMatch(commitTitle: string): RegExpExecArray | undefined {
	const match = /^(?<type>\w+)(?:\((?<scope>.+)\))?: .+$/.exec(commitTitle);

	if (!match) {
		return;
	}

	return match;
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
