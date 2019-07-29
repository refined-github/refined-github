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
	id: __featureName__,
	description: 'Bypasses the "Checks" interstitial when clicking the "Details" links on a PR.',
	screenshot: 'https://user-images.githubusercontent.com/2103975/49071220-c6596e80-f22d-11e8-8a1e-bdcd62aa6ece.png',
	include: [
		features.isPRConversation
	],
	load: features.onAjaxedPages,
	init
});
