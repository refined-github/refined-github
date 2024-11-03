import React from 'dom-chef';
// import domify from 'doma';
import CodeSquare from 'octicons-plain-react/CodeSquare';
import CloseIcon from 'octicons-plain-react/XCircle';
import * as pageDetect from 'github-url-detection';
import mem from 'memoize';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import { searchResultFileName } from '../github-helpers/selectors.js';
import { messageBackground } from '../helpers/messaging.js';

// Fetch via background.js due to CORB policies. Also memoize to avoid multiple requests.
const fetchFile = mem(
	async (url: string): Promise<string> =>
		messageBackground({ fetchText: url }),
);

function init(signal: AbortSignal): void {
	const dialogElement = (
		<dialog className="PreviewResults--Dialog">
			<div className="PreviewResults--Dialog__CloseBtn">
				<CloseIcon onClick={() => dialogElement.close()} />
			</div>

			<pre id="refined-preview-search-result-pre-content"></pre>
		</dialog>
	) as unknown as HTMLDialogElement;

	document.body.append(dialogElement);

	observe(searchResultFileName, (link: HTMLAnchorElement) => {
		link.parentNode?.prepend(
			<a
				href="#"
				title="Preview File"
				className="self-end px-2"
				onClick={async event => {
					event.preventDefault();
					const url = new URL(link.href);
					const urlWithoutParameters = `${url.origin}${url.pathname.replace('blob', 'raw')}`;
					const fileBody = await fetchFile(new URL(urlWithoutParameters).toString());

					const dialogPreElement = document.querySelector('#refined-preview-search-result-pre-content');
					if (dialogPreElement) {
						dialogPreElement.textContent = fileBody;
					}
					dialogElement.showModal();
				}}
			>
				<CodeSquare />
			</a>,
		);
	}, { signal });
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isGlobalSearchResults,
	],
	init,
});

/*

Test URLs

https://github.com/refined-github/sandbox/issues/77

*/
