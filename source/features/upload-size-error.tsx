import delegate, {type DelegateEvent} from 'delegate-it';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import showToast from '../github-helpers/toast.js';

const failedUploadRegex = /<!-- Failed to upload "(?<fileName>.+?)" -->/g;
const failureCounts = new WeakMap<HTMLTextAreaElement, number>();

function onInput(event: DelegateEvent<Event, HTMLTextAreaElement>): void {
	const textarea = event.delegateTarget;
	const matches = [...textarea.value.matchAll(failedUploadRegex)];
	const previousCount = failureCounts.get(textarea) ?? 0;
	failureCounts.set(textarea, matches.length);

	if (matches.length <= previousCount) {
		return;
	}

	const {fileName} = matches.at(-1)!.groups!;

	const error = Object.assign(new Error(`GitHub rejected "${fileName}"`), {
		richMessage: (
			<>
				GitHub rejected <strong>{fileName}</strong>: the file is over GitHub’s size limit.{' '}
				<a
					href="https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/attaching-files"
					target="_blank"
					rel="noreferrer"
					style={{color: 'inherit', textDecoration: 'underline'}}
				>
					See limits
				</a>
			</>
		),
	});

	void showToast(error).catch(() => {/* showToast rethrows the error on purpose */});
}

function init(signal: AbortSignal): void {
	delegate('textarea', 'input', onInput, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRichTextEditor,
	],
	init,
});

/*

Test URLs

Any page with a comment box, drop a file over 10 MB:
https://github.com/refined-github/refined-github/issues/10347

*/
