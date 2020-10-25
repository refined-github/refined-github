import React from 'dom-chef';

const splittingRegex = /`(.*?)`/g;

export default function parseBackticks(description: string): DocumentFragment {
	const fragment = new DocumentFragment();
	for (const [index, text] of description.split(splittingRegex).entries()) {
		if (index % 2 && text.length >= 1) {
			// `span.sr-only` keeps the backticks copy-pastable but invisible
			fragment.append(
				<span className="sr-only">`</span>,
				<code className="rgh-parse-backticks">
					{text.trim()}
				</code>,
				<span className="sr-only">`</span>
			);
		} else if (text.length > 0) {
			fragment.append(text);
		}
	}

	return fragment;
}
