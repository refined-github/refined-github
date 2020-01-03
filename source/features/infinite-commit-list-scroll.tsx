import select from 'select-dom';
import React from 'dom-chef';
import fetchDom from '../libs/fetch-dom';
import features from '../libs/features';

// Used feature: infinite-scroll as template

// Button from: https://primer.style/css/components/loaders
const githubLoadingButton = <button className="btn mn-3" disabled><span>Loading</span><span className="AnimatedEllipsis"></span></button>;

let container: HTMLElement;
let link: HTMLAnchorElement | undefined;

let lastDate: string;

function getLastDate(document_?: HTMLDivElement): string {
	if (!document_) {
		document_ = select<HTMLDivElement>('.commits-listing')!;
	}

	const lastDivInCommitListing = select('.commits-listing > div:last-of-type', document_);
	return lastDivInCommitListing!.textContent!;
}

async function appendOlder(): Promise<void> {
	// Don't load if we don't have the link

	if (!link?.href) {
		return;
	}

	// Replace buttons with loading button
	select('*', container)!.remove();
	container.append(githubLoadingButton);

	// Fetch older content
	const olderContent = await fetchDom(link.href, '.repository-content')!;
	if (!olderContent) {
		console.log('Failed to fetch next page');
		return;
	}

	const olderList = select<HTMLDivElement>('.commits-listing', olderContent)!;

	// Remove duplicate "Commits on %date%" lines
	const firstDate = select('div', olderList);
	if (firstDate!.textContent === lastDate) {
		olderList.removeChild(firstDate!);
	}

	lastDate = getLastDate(olderList);

	// Add border to differentiate appended content
	olderList.classList.add('border-top', 'border-gray-dark');
	container.before(olderList);

	// Set loading button to Newer and Older links
	select('*', container)!.remove();
	container.append(select('.paginate-container > .BtnGroup', olderContent)!);

	link = select<HTMLAnchorElement>('div > a:last-child', container)!;
}

const inView = new IntersectionObserver(([{isIntersecting}]) => {
	if (isIntersecting) {
		appendOlder();
	}
}, {
	rootMargin: '500px'
});

function init(): void {
	lastDate = getLastDate();

	container = select<HTMLDivElement>('.paginate-container')!;
	link = select<HTMLAnchorElement>('div > a:last-child', container)!;

	if (link) {
		inView.observe(container);
	}
}

features.add({
	id: __featureName__,
	description: 'Infinite scroll on commit list',
	screenshot: false,
	include: [
		features.isCommitList
	],
	load: features.onDomReady,
	init
});
