import {$optional} from 'select-dom';

export default function getSearchResultUrl(item: ParentNode): string | undefined {
	const actionListItem = $optional('.ActionListItem[data-href]', item);
	if (!actionListItem) {
		return;
	}

	const {href} = actionListItem.dataset;
	if (!href) {
		return;
	}

	const url = new URL(href, location.origin);
	if (url.origin !== location.origin) {
		return;
	}

	return url.href;
}
