import select from 'select-dom';
import delegate from 'delegate-it';
import * as pageDetect from 'github-url-detection';

import features from '.';

const paginationButtonSelector = '.ajax-pagination-form button[type="submit"]';

function onPaginationFormLoad(form: HTMLFormElement, callback: VoidFunction): void {
	form.addEventListener('page:loaded', callback);
}

function submitNewPaginationForm(wrapper: Element): void {
	const wrapperSelector = wrapper.classList.contains('TimelineItem-body') ? ':scope' : ':scope > #js-progressive-timeline-item-container:last-child';
	const paginationButton = select(`${wrapperSelector} > ${paginationButtonSelector}`, wrapper);
	if (!paginationButton) {
		return;
	}

	const subWrapper = paginationButton.form!.parentElement!;
	onPaginationFormLoad(paginationButton.form!, () => {
		submitNewPaginationForm(subWrapper);
	});

	paginationButton.click();
}

function handleAltClick({altKey, delegateTarget}: delegate.Event<MouseEvent, HTMLButtonElement>): void {
	if (!altKey) {
		return;
	}

	const wrapperSelector = [
		'#js-progressive-timeline-item-container', // Main conversation thread
		'.TimelineItem-body', // Review thread
	].join(',');

	const wrapper = delegateTarget.closest(wrapperSelector)!;
	onPaginationFormLoad(delegateTarget.form!, () => {
		submitNewPaginationForm(wrapper);
	});
}

function init(): Deinit {
	return delegate(document, paginationButtonSelector, 'click', handleAltClick);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isConversation,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
