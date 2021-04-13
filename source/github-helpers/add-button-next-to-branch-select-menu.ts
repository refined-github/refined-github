import select from 'select-dom';
import elementReady from 'element-ready';

export default async function addButtonNextToBranchSelectMenu(button: Element): Promise<void> {
	const branchSelector = (await elementReady('#branch-select-menu', {waitForChildren: false}))!;
	const wrapper = branchSelector.closest('.position-relative')!;
	button.classList.add('mt-md-2', 'mt-lg-0');
	wrapper.append(button);
	if (wrapper.classList.contains('rgh-button-added')) {
		return;
	}

	branchSelector.classList.add('mr-2');
	wrapper.classList.add('d-flex', 'd-md-block', 'd-lg-flex', 'rgh-button-added');
	select('.breadcrumb')!.classList.add('flex-md-self-baseline', 'flex-lg-self-center');
}
