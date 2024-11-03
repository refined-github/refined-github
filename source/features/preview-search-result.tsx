import React from 'dom-chef';
import CodeSquare from 'octicons-plain-react/CodeSquare';
import Copy from 'octicons-plain-react/Copy';
import Close from 'octicons-plain-react/XCircle';
import NewTab from 'octicons-plain-react/LinkExternal';
import * as pageDetect from 'github-url-detection';
import mem from 'memoize';
import {messageRuntime} from 'webext-msg';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {searchResultFileName} from '../github-helpers/selectors.js';

import './preview-search-result.css';

// Fetch via background.js due to CORB policies. Also memoize to avoid multiple requests.
const fetchFile = mem(
	async (url: string): Promise<string> =>
		messageRuntime({fetchText: url}),
);

function openInBackground(url: string): void {
	messageRuntime({
		openUrls: [url],
	});
}

function init(signal: AbortSignal): void {
	let originalUrl = '';

	const dialogElement = (
		<dialog className="PreviewResults--Dialog" onClick={onClickOutside}>
			<div className="PreviewResults--Dialog__Header">
				<div id="refined-preview-search-result-filename"></div>
				<div className="PreviewResults--Dialog__HeaderActions">
					<Copy
						title="Copy Contents to Clipboard"
						className="PreviewResults--Dialog__CopyBtn"
						onClick={() => copyToClipboard()}
					/>
					<NewTab
						title="Open in Background Tab"
						className="PreviewResults--Dialog__NewTabBtn"
						onClick={() => openInBackground(originalUrl)}
					/>
					<Close
						title="Close Preview"
						className="PreviewResults--Dialog__CloseBtn"
						onClick={() => dialogElement.close()}
					/>
				</div>
			</div>

			<pre id="refined-preview-search-result-pre-content"></pre>
		</dialog>
	) as unknown as HTMLDialogElement;

	dialogElement.addEventListener('close', () => {
		setTimeout(() => {
			document.body.style.overflow = 'unset';
		}, 500);
	});

	function onClickOutside(event: React.MouseEvent<HTMLDialogElement>): void {
		if (event.target === dialogElement) {
			dialogElement.close();
		}
	}

	function copyToClipboard(): void {
		navigator.clipboard.writeText(dialogElement.textContent)
			.catch(error => {
				console.error('Failed to copy text:', error);
			});
	}

	document.body.append(dialogElement);

	observe(searchResultFileName, (link: HTMLAnchorElement) => {
		link.parentNode?.prepend(
			<a
				href="#"
				title="Preview File"
				className="self-end px-2"
				onClick={async event => {
					event.preventDefault();
					originalUrl = link.href;
					const url = new URL(link.href);
					const urlWithoutParameters = `${url.origin}${url.pathname.replace('blob', 'raw')}`;
					const fileBody = await fetchFile(new URL(urlWithoutParameters).toString());

					// Set <pre> content to file contents
					const dialogPreElement = document.querySelector('#refined-preview-search-result-pre-content');
					if (dialogPreElement) {
						dialogPreElement.textContent = fileBody;
					}

					// Set dialog header file name
					const dialogFilename = document.querySelector('#refined-preview-search-result-filename');
					if (dialogFilename) {
						dialogFilename.textContent = link.textContent;
					}

					dialogElement.showModal();
					document.body.style.overflow = 'hidden';
				}}
			>
				<CodeSquare />
			</a>,
		);
	}, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isGlobalSearchResults,
	],
	init,
});

/*

Test URLs

https://github.com/search?q=tauri&type=code

*/
