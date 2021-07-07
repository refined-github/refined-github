import React from 'dom-chef';

const splittingRegex = /`` (.*?) ``|`([^`\n]+)`/g;

export function getParsedBackticksParts(string: string): string[] {
	return string.split(splittingRegex)
		.filter(part => part !== undefined); // Only one of the regexp's capture groups matches
}

export default function parseBackticks(description: string): DocumentFragment {
	const fragment = new DocumentFragment();
	for (const [index, text] of getParsedBackticksParts(description).entries()) {
		if (index % 2 && text.length > 0) {
			// `span.sr-only` keeps the backticks copy-pastable but invisible
			fragment.append(
				<span className="sr-only">`</span>,
				<code className="rgh-parse-backticks">{text.trim()}</code>,
				<span className="sr-only">`</span>,
			);
		} else if (text.length > 0) {
			fragment.append(text);
		}
	}

	return fragment;
}
