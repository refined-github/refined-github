import {$, $$} from 'select-dom/strict.js';
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
	const {title, textContent} = referenceElement;
	return parseReferenceRaw(title, textContent.trim());
}

export function getBranches(): {base: PrReference; head: PrReference} {
	// Try old selectors first (for compatibility with older GitHub UI)
	// but dont blow up if select-dom fails
	try {
		const baseElement = $('.base-ref');
		const headElement = $('.head-ref');

		if (baseElement && headElement) {
			// Use existing logic
			return {
				base: parseReference(baseElement as HTMLElement),
				head: parseReference(headElement as HTMLElement),
			};
		}
	} catch {}

	// New GitHub UI: extract from /tree/ links
	const links = [...new Map($$('a[href*="/tree/"]').map(link => [link.href, link])).values()];
	let baseRef: PrReference | undefined;
	let headRef: PrReference | undefined;

	for (const link of links) {
		const href = link.getAttribute('href') || '';
		const match = href.match(/\/tree\/([^/]+)$/);
		if (match) {
			const branch = match[1];
			const text = link.textContent?.trim() || branch;

			try {
				const repo = pageDetect.utils.getRepositoryInfo(globalThis.location);
				const absoluteRef = href?.replaceAll(`https://github.com/${repo?.nameWithOwner}/`, '') ?? '';
				const branch = absoluteRef.replace(`/${repo?.nameWithOwner}/tree/`, '');

				const ref = parseReferenceRaw(`${repo?.nameWithOwner}:${branch}`, text);

				if (!baseRef) {
					baseRef = ref;
				} else if (!headRef) {
					headRef = ref;
					break;
				}
			} catch {
				// Skip invalid references
				continue;
			}
		}
	}

	if (baseRef && headRef) {
		return {base: baseRef, head: headRef};
	}

	throw new Error('Could not find PR branch information');
}
