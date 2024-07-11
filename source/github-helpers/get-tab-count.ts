import {$} from 'select-dom';
import oneMutation from 'one-mutation';

export default async function getTabCount(tab: Element): Promise<number> {
	const counter = $('.Counter, .num', tab);
	if (!counter) {
		// GitHub might have already dropped the counter, which means it's 0
		return 0;
	}

	if (!counter.firstChild) {
		// It's still loading
		await oneMutation(tab, {childList: true, subtree: true});
	}

	return Number(counter.textContent);
}
