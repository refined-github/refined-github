import {$} from 'select-dom/strict.js';

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
