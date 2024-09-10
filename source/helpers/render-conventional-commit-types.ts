import zipTextNodes from 'zip-text-nodes';

// Using https://www.conventionalcommits.org/ as a reference.

export function getConventionalCommitAndScope(commitTitle: string): {type: string; scope: string | undefined} | undefined {
	const match = /^(?<type>\w+)(?:\((?<scope>.+)\))?: .+$/.exec(commitTitle);

	if (!match?.groups) {
		return;
	}

	const {type, scope} = match.groups;
	return {type, scope};
}

export function strip(
	element: HTMLElement,
	from: string,
): void {
	const modified = element.textContent
		.replace(from, match => `<s>${match}</s>`);

	const temporaryDiv = document.createElement('div');
	temporaryDiv.innerHTML = modified;

	zipTextNodes(element, temporaryDiv);

	element.querySelector('s')!.remove();
}
