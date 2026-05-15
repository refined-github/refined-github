import './diff-stats-by-extension.css';

import React from 'dom-chef';
import {isAlteredClick} from 'filter-altered-clicks';
import * as pageDetect from 'github-url-detection';
import {$optional, $$, elementExists} from 'select-dom';
import {CachedFunction} from 'webext-storage-cache';

import features from '../feature-manager.js';
import api, {RefinedGitHubApiError} from '../github-helpers/api.js';
import {
	groupPullRequestFilesByExtension,
	type PullRequestFileRow,
} from '../github-helpers/group-pr-files-by-extension.js';
import {getConversationNumber, getRepo} from '../github-helpers/index.js';
import observe from '../helpers/selector-observer.js';

const diffstatSelector = [
	'[class*="PullRequestHeader-module__diffStatesWrapper"]',
	'.tabnav-extra:has(> .diffstat)',
	'#diffstat',
].join(',\n');

const maxPages = 30;

type FetchResult = {
	files: PullRequestFileRow[];
	truncated: boolean;
};

const pullRequestFilesForDiffstat = new CachedFunction('pr-files-diffstat-by-extension', {
	async updater(): Promise<FetchResult> {
		const pullRequestNumber = getConversationNumber();
		if (!pullRequestNumber) {
			return {files: [], truncated: false};
		}

		const files: PullRequestFileRow[] = [];
		let truncated = false;
		let pageIndex = 0;

		for await (const page of api.v3paginated(`pulls/${pullRequestNumber}/files?per_page=100`)) {
			pageIndex++;
			const batch = page as unknown as PullRequestFileRow[];
			files.push(...batch);

			if (pageIndex >= maxPages) {
				truncated = batch.length === 100;
				break;
			}
		}

		return {files, truncated};
	},
	maxAge: {minutes: 5},
	staleWhileRevalidate: {hours: 1},
	cacheKey(): string {
		const repo = getRepo();
		const number = getConversationNumber();
		if (!repo || !number) {
			return '';
		}

		return `${repo.nameWithOwner}#${number}`;
	},
});

function getDiffstatRoot(): HTMLElement | undefined {
	const reactDiffstat = $$('[class*="PullRequestHeader-module__diffStatesWrapper"]').find(element => {
		const screenReaderText = $optional('.sr-only', element);
		if (!screenReaderText) {
			return false;
		}

		return screenReaderText.textContent.trim().startsWith('Lines changed:');
	});
	if (reactDiffstat) {
		return reactDiffstat;
	}

	const legacy = $optional('#diffstat') ?? $optional('.tabnav-extra:has(> .diffstat)');
	return legacy instanceof HTMLElement ? legacy : undefined;
}

type PopoverCapable = HTMLElement & {
	showPopover: () => void;
	hidePopover: () => void;
};

function renderLoading(): HTMLElement {
	return (
		<div className="Overlay Overlay--size-auto">
			<div className="px-3 py-4 color-fg-muted">Loading file list…</div>
		</div>
	);
}

function renderError(message: string, onRetry: () => void): HTMLElement {
	return (
		<div className="Overlay Overlay--size-auto">
			<div className="px-3 py-3">
				<div className="flash flash-warn mb-2">{message}</div>
				<button type="button" className="btn btn-sm" onClick={onRetry}>
					Retry
				</button>
			</div>
		</div>
	);
}

function renderRows(
	rows: Array<{label: string; additions: number; deletions: number}>,
	options: {truncated: boolean; zeroLineFileCount: number},
): HTMLElement {
	return (
		<div className="Overlay Overlay--size-auto">
			<div className="px-3 pt-3 pb-2">
				<div className="h6 color-fg-muted mb-2">Lines by file type</div>
				<ul className="ActionListWrap ActionListWrap--inset">
					{rows.map(row => (
						<li className="ActionListItem">
							<div className="ActionListContent">
								<span className="text-mono flex-auto">{row.label}</span>
								<span className="text-mono no-wrap">
									<span className="color-fg-success">+{row.additions}</span>{' '}
									<span className="color-fg-danger">−{row.deletions}</span>
								</span>
							</div>
						</li>
					))}
				</ul>
				{options.truncated && (
					<p className="color-fg-muted f6 px-2 mt-2 mb-0">
						Some files were not loaded; counts may be incomplete.
					</p>
				)}
				{options.zeroLineFileCount > 0 && (
					<p className="color-fg-muted f6 px-2 mt-2 mb-0">
						{options.zeroLineFileCount} file{options.zeroLineFileCount === 1 ? '' : 's'} had no line-level diff (binary or generated).
					</p>
				)}
			</div>
		</div>
	);
}

function renderEmpty(): HTMLElement {
	return (
		<div className="Overlay Overlay--size-auto">
			<div className="px-3 py-3 color-fg-muted">No line-level changes in these files.</div>
		</div>
	);
}

function replacePopoverBody(popover: HTMLElement, body: HTMLElement): void {
	popover.replaceChildren(body);
}

function attachEnhancement(root: HTMLElement, signal: AbortSignal): void {
	const prNumber = getConversationNumber();
	if (!prNumber) {
		return;
	}

	const popoverId = `rgh-pr-diffstat-popover-${prNumber}`;
	if (elementExists('#' + popoverId)) {
		return;
	}

	if (root.dataset.rghDiffstatExtension === '1') {
		return;
	}

	root.dataset.rghDiffstatExtension = '1';

	const anchorId = `rgh-pr-diffstat-anchor-${prNumber}`;
	const anchor = (
		<span
			id={anchorId}
			className="rgh-pr-diffstat-anchor"
			aria-hidden="true"
			style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}
		/>
	);

	const computedPosition = getComputedStyle(root).position;
	if (computedPosition === 'static') {
		root.style.position = 'relative';
		root.dataset.rghDiffstatPositioned = '1';
	}

	root.prepend(anchor);

	const popover = (
		<anchored-position id={popoverId} anchor={anchorId} popover="auto" className="rgh-pr-diffstat-by-ext-popover" />
	) as unknown as PopoverCapable;

	popover.append(renderLoading());
	root.after(popover);

	let loadState: 'idle' | 'loading' | 'ready' | 'error' = 'idle';

	const load = async (fresh = false): Promise<void> => {
		loadState = 'loading';
		replacePopoverBody(popover, renderLoading());
		try {
			const {files, truncated} = fresh
				? await pullRequestFilesForDiffstat.getFresh()
				: await pullRequestFilesForDiffstat.get();
			const {rows, zeroLineFileCount} = groupPullRequestFilesByExtension(files);
			loadState = 'ready';
			if (rows.length === 0) {
				replacePopoverBody(popover, renderEmpty());
			} else {
				replacePopoverBody(popover, renderRows(rows, {truncated, zeroLineFileCount}));
			}
		} catch (error) {
			loadState = 'error';
			let message = 'Unable to load file list.';
			if (error instanceof RefinedGitHubApiError) {
				message = error.message;
			} else if (error instanceof Error) {
				message = error.message;
			}

			replacePopoverBody(
				popover,
				renderError(message, () => {
					void load(true);
				}),
			);
		}
	};

	const onRootClick = (event: MouseEvent): void => {
		if (!(event.target instanceof Node) || !root.contains(event.target)) {
			return;
		}

		if (isAlteredClick(event)) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		const open = !popover.matches(':popover-open');
		if (open) {
			popover.showPopover();
			if (loadState === 'idle' || loadState === 'error') {
				void load();
			}
		} else {
			popover.hidePopover();
		}
	};

	root.addEventListener('click', onRootClick, {capture: true, signal});

	signal.addEventListener('abort', () => {
		popover.remove();
		anchor.remove();
		delete root.dataset.rghDiffstatExtension;
		if (root.dataset.rghDiffstatPositioned === '1') {
			root.style.position = '';
			delete root.dataset.rghDiffstatPositioned;
		}
	});
}

async function init(signal: AbortSignal): Promise<void> {
	observe(
		diffstatSelector,
		() => {
			const root = getDiffstatRoot();
			if (root) {
				attachEnhancement(root, signal);
			}
		},
		{signal},
	);

	const root = getDiffstatRoot();
	if (root) {
		attachEnhancement(root, signal);
	}
}

void features.add(import.meta.url, {
	include: [pageDetect.isPRConversation, pageDetect.isPRFiles],
	awaitDomReady: true,
	init,
});

/*

## Test URLs

https://github.com/refined-github/refined-github/pull/7036
https://github.com/refined-github/refined-github/pull/7036/files
https://github.com/refined-github/sandbox/pull/71/files

*/
