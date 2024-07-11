import {$} from 'select-dom';

export type PrReference = {
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

const absoluteReferenceRegex = /^(?<nameWithOwner>(?<owner>[^:]+)\/(?<name>[^:]+)):(?<branch>.+)$/;

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
	const {title, textContent} = referenceElement;
	return parseReferenceRaw(title, textContent.trim());
}

export function getBranches(): {base: PrReference; head: PrReference} {
	return {
		get base() {
			return parseReference($('.base-ref')!);
		},
		get head() {
			return parseReference($('.head-ref')!);
		},
	};
}
