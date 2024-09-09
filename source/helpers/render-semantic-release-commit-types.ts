import zipTextNodes from 'zip-text-nodes';

// Using https://github.com/angular/angular/blob/main/CONTRIBUTING.md?rgh-link-date=2024-09-09T05%3A51%3A31Z#-commit-message-format as the reference for the seamntic commit message format.

export function getSemanticCommitAndScope(commitTitle: string): [string, string?] | undefined {
	const match = /^(\w*)(?:\((.+)\))?!?:.*/.exec(commitTitle);

	if (!match) {
		return undefined;
	}

	return [match[1], match[2]];
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
