import {$} from 'select-dom/strict.js';
import * as pageDetect from 'github-url-detection';

type PrReference = {
	/** @example fregante/mem:main */
	absolute: string;

	/** @example "main" on same-repo PRs, "fregante:main" on cross-repo PRs  */
	relative: string;

	/** @example fregante */
	owner: string;

	/** @example mem */
	name: string;

	/** @example main */
	branch: string;

	/** @example fregante:mem */
	nameWithOwner: string;
};

const absoluteReferenceRegex = /^(?<nameWithOwner>(?<owner>[^:/]+)\/(?<name>[^:]+)):(?<branch>.+)$/;

/**
 * @param absolute - The full reference, e.g. `fregante/mem:main`
 * @param relative - The references it appear to the user in the PR, e.g. "main" on same-repo PRs, "fregante:main" on cross-repo PRs
 * @example parseReferenceRaw('fregante/mem:main', 'main')
 */
export function parseReferenceRaw(absolute: string, relative: string): PrReference {
	const absoluteMatch = absoluteReferenceRegex.exec(absolute);
	if (!absoluteMatch) {
		throw new TypeError(`Expected \`absolute\` to be "user/repo:branch", got "${absolute}"`);
	}

	const {owner, name, nameWithOwner, branch} = absoluteMatch.groups!;

	// We must receive the relative reference because it also tells whether it's a cross-repo PR
	const expectedRelative = [branch, `${owner}:${branch}`];
	if (!expectedRelative.includes(relative)) {
		throw new TypeError(`Expected \`relative\` to be either "${expectedRelative.join('" or "')}", got "${relative}"`);
	}

	return {
		owner,
		name,
		branch,
		nameWithOwner,
		absolute,
		relative,
	};
}

function parseReference(referenceElement: HTMLElement): PrReference {
	const {title, textContent, nextElementSibling} = referenceElement;

	// In the React version, we have a `title` attribute but it's used to mark deleted repos instead
	return title && title !== 'This repository has been deleted'
		? parseReferenceRaw(title, textContent.trim()) // TODO: Remove in June 2026
		: parseReferenceRaw(nextElementSibling!.textContent.trim(), textContent.trim());
}

export function getBranches(): {base: PrReference; head: PrReference} {
	return {
		get base() {
			return parseReference($([
				'[class*="PullRequestHeaderSummary"] > [class*="PullRequestHeaderSummary"]',
				'.base-ref', // TODO: Remove in June 2026
			]));
		},
		get head() {
			return parseReference($([
				'[class*="PullRequestHeaderSummary"] * [class*="PullRequestHeaderSummary"]',
				'.head-ref', // TODO: Remove in June 2026
			]));
		},
	};
}

export function getFilenames(menuItem: HTMLElement): {original: string; new: string} {
	if (menuItem.tagName === 'A') {
		const fileUrl = menuItem
			.parentElement!
			.parentElement!
			.querySelector('li[data-variant="danger"] a')!
			.href;

		const repo = pageDetect.utils.getRepositoryInfo(globalThis.location);
		const {head} = getBranches();

		const reactPropsRaw = $('[data-target="react-app.embeddedData"]').textContent;
		const reactProps = JSON.parse(reactPropsRaw);

		let originalFileName = '';
		// Get the new filename from the "Delete" button href
		const newFileName = fileUrl?.replaceAll(`https://github.com/${repo?.nameWithOwner}/delete/${head.branch}/`, '') ?? '';

		// Leverage the React props inlined in a script tag in order to determine whether or not we're dealing with a RENAME
		// type change, in which case we'll also need to find the old filename correctly
		const diffContents = reactProps.payload.diffContents.find((dc: Record<string, unknown>) => dc.path === newFileName);
		if (diffContents.status === 'RENAMED') {
			originalFileName = diffContents.oldTreeEntry.path;
		} else {
			originalFileName = newFileName;
		}

		return {original: originalFileName, new: newFileName};
	} else {
		const [originalFileName, newFileName = originalFileName] = menuItem
			.closest('[data-path]')!
			.querySelector('.Link--primary')!
			.textContent
			.split(' → ');

		return {original: originalFileName, new: newFileName};
	}
};
