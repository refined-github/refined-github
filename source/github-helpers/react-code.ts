import escapeStringRegexp from 'escape-string-regexp';

export function splitText(line: HTMLElement, text: string): HTMLElement[] { // eslint-disable-line import/prefer-default-export
	const found: HTMLElement[] = [];
	const splitterRegex = new RegExp('(' + escapeStringRegexp(text) + ')', 'g');
	// eslint-disable-next-line unicorn/no-useless-spread -- Necessary because .children is a live collection, it will enter a loop without this
	for (const element of [...line.children]) {
		const nodeValue = element.textContent || element.getAttribute('data-code-text');
		if (nodeValue?.includes(text)) {
			const replacements = nodeValue.split(splitterRegex).map(value => {
				const clone = element.cloneNode(true) as HTMLElement;
				if (element.hasAttribute('data-code-text')) {
					clone.setAttribute('data-code-text', value);
				} else {
					clone.textContent = value;
				}

				return clone;
			});
			element.replaceWith(...replacements);

			// Elements in odd positions are the text elements we're looking for
			for (let i = 1; i < replacements.length; i += 2) {
				found.push(replacements[i]);
			}
		}
	}

	return found;
}
