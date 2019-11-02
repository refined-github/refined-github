import React from 'dom-chef';

const splittingRegex = /`(.*?)`/g;

function splitTextReducer(fragment: DocumentFragment, text: string, index: number): DocumentFragment {
	// Code is always in odd positions
	if (index % 2 && text.length >= 1) {
		// `span.sr-only` keeps the backticks copy-pastable but invisible
		fragment.append(
			<code className="rgh-parse-backticks">
				<span className="sr-only">`</span>
				{text}
				<span className="sr-only">`</span>
			</code>
		);
	} else if (text.length > 0) {
		fragment.append(text);
	}

	return fragment;
}

export default function parseBackticks(description: string): DocumentFragment {
	return description
		.split(splittingRegex)
		.reduce(splitTextReducer, new DocumentFragment());
}
