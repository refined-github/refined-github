import select from 'select-dom';
import features from '../libs/features';
import fetchDom from '../libs/fetch-dom';

async function init(): Promise<void> {
	// If anything errors, RGH will display the error next to the feature name
	await Promise.all(select.all('.merge-status-item [href^="/apps/"]:not([href^="/apps/github-actions"])').map(bypass));
}

async function bypass(check: HTMLElement): Promise<void> {
	const details = select<HTMLAnchorElement>('.status-actions', check.parentElement!)!;
	const directLink = await fetchDom(details.href, 'a.text-small .octicon-link-external');
	details.href = (directLink.parentElement as HTMLAnchorElement).href;
}

features.add({
	id: 'bypass-checks',
	description: 'Bypass the `Checks` page and go directly to build results when clicking the `Details` links on a pull request',
	include: [
		features.isPRConversation
	],
	load: features.onAjaxedPages,
	init
});
