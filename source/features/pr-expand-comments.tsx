import * as pageDetect from 'github-url-detection';
import select from 'select-dom';
import features from '../feature-manager';

async function selectAndClickLoadMoreBtns(): Promise<boolean> {
    const buttons: HTMLButtonElement[] = select.all('.ajax-pagination-btn[data-disable-with="Loading…"]');
    if(!buttons || buttons.length === 0) {
        return false; // no more buttons
    }

    await Promise.all(buttons.map(async (button) => {
        button.click();

        while (button.disabled) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }));

    return true; // more buttons
}

async function loadComments(): Promise<void> {
    let loadMoreBtns = true;
    while (loadMoreBtns) {
        loadMoreBtns = await selectAndClickLoadMoreBtns();
    }
}

function init(): void {
    loadComments();
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPR,
        pageDetect.isIssue,
	],
	init,
});
