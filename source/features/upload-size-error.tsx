import delegate, {type DelegateEvent} from 'delegate-it';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import showToast from '../github-helpers/toast.js';

const maxUploadSize = 10_000_000;

function reportOversizedFiles(files: FileList): void {
	for (const file of files) {
		if (file.size <= maxUploadSize) {
			continue;
		}

		const sizeInMb = (file.size / 1_000_000).toFixed(1);

		const error = Object.assign(new Error(`${file.name} is too large to upload`), {
			richMessage: (
				<>
					<strong>{file.name}</strong> is {sizeInMb} MB, but GitHub only allows uploads up to 10 MB.{' '}
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
}

function onDrop(event: DelegateEvent<DragEvent, HTMLTextAreaElement>): void {
	const {files} = event.dataTransfer!;
	if (files) {
		reportOversizedFiles(files);
	}
}

function init(signal: AbortSignal): void {
	delegate('textarea', 'drop', onDrop, {signal});
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
