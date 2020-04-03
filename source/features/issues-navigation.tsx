import features from '../libs/features';

/**
 * TODO: find a way o parse this correctly, maybe ask a GitHub developer how this is parsed?
 * ex: `is:issue is:open sort:updated-desc label:"change request" show branch`
 */
let referrerSearchQuery: string | null;
function init(): void {
	// 1. Parse `referrerSearchQuery`
	// 2. Make API request to get issues based on query
	//    To make API call smaller, find a way to get only next and previous issue
	//    If we can persist state between issue navigation,
	//    we can request more next and previous issues,
	//    and we can make another request only when we getting out of range of current issues
	// 3. If exists next issue, add shortcut to navigate to next issue
	// 3. If exists previous issue, add shortcut to navigate to previous issue
	console.log(referrerSearchQuery);
}

features.add({
	id: __featureName__,
	description: 'Issues navigation shortcuts',
	screenshot: 'https://picsum.photos/500/200'
}, {
	include: [features.isIssue],
	exclude: [notCommingFromIssueList],
	load: features.onAjaxedPages,
	init
});

function notCommingFromIssueList(): boolean {
	if (!document.referrer) {
		return true;
	}

	try {
		const {pathname, searchParams} = new URL(document.referrer);
		// Expecting ['', 'username', 'repo-name', 'issues']
		const list = pathname.split('/')[3];
		referrerSearchQuery = searchParams.get('q');
		return !(list === 'issues' && referrerSearchQuery);
	} catch (error) {
		console.log(error);
		return true;
	}
}
