import select from 'select-dom';
import splitOnFirst from 'split-on-first';

export type PrReference = {
	/** @example fregante/mem:main */
	full: string;

	/** @example "main" on same-repo PRs, "fregante:main" on cross-repo PRs  */
	local: string;

	/** @example fregante */
	owner: string;

	/** @example mem */
	name: string;

	/** @example main */
	branch: string;
};

function parseReference(referenceElement: HTMLElement): PrReference {
	const {title: full, textContent: local} = referenceElement;
	const [nameWithOwner, branch] = splitOnFirst(full, ':') as [string, string];
	const [owner, name] = nameWithOwner.split(':');
	return {full, owner, name, branch, local: local!.trim()};
}

// TODO: Use in more places, like anywhere '.base-ref' appears
export function getBranches(): {base: PrReference; head: PrReference} {
	return {
		base: parseReference(select('.base-ref')!),
		head: parseReference(select('.head-ref')!),
	};
}
