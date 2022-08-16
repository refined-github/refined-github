import mem from 'mem';
import select from 'select-dom';

import {onPrMergePanelLoad} from './on-fragment-load';

const getDeduplicatedHandler = mem((callback: EventListener): EventListener => () => {
	// Wait for GitHub to update the contents of the merge commit summary field
	select('input#merge_title_field')!.addEventListener('change', callback, {once: true});
});

export default function onPrCommitMessageRestore(callback: EventListener, signal: AbortSignal): void {
	onPrMergePanelLoad(getDeduplicatedHandler(callback), signal);
}
