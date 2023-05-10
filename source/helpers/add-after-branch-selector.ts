export default function addAfterBranchSelector(branchSelectorParent: HTMLDetailsElement, sibling: HTMLElement): void {
	const row = branchSelectorParent.closest('.position-relative')!;
	row.classList.add('d-flex', 'flex-shrink-0', 'gap-2');
	row.append(sibling);
}
