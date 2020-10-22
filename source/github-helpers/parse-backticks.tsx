import React from 'dom-chef';

const splittingRegex = /`` (.*?) ``|`(.*?)`/g;

export default function parseBackticks(description: string): DocumentFragment {
	const fragment = new DocumentFragment();
	const textParts = description.split(splittingRegex)
		.filter(part => part !== undefined); // Only one of the regexp's capture groups matches
	for (const [index, text] of textParts.entries()) {
		if (index % 2 && text.length >= 1) {
			// `span.sr-only` keeps the backticks copy-pastable but invisible
			fragment.append(
				<code className="rgh-parse-backticks">
					<span className="sr-only">`</span>
					{text.trim()}
					<span className="sr-only">`</span>
				</code>
			);
		} else if (text.length > 0) {
			fragment.append(text);
		}
	}

	return fragment;
}
