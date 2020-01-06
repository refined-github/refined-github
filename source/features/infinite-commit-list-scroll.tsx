import select from 'select-dom';
import React from 'dom-chef';
import fetchDom from '../libs/fetch-dom';
import features from '../libs/features';

// Button from: https://primer.style/css/components/loaders
const githubLoadingButton = <button className="btn mn-3" disabled><span>Loading</span><span className="AnimatedEllipsis"></span></button>;

let container: HTMLElement;
let link: HTMLAnchorElement | undefined;

let lastDate: string;

function setLastDate(document_ = select('.commits-listing')!): void {
	const lastDateInOlderListing = select('div.commit-group-title:last-of-type', document_);

	// If there were enough commits in one day there is not last date
	if (lastDateInOlderListing) {
		lastDate = lastDateInOlderListing?.textContent!;
	}
}

async function appendOlder(): Promise<void> {
	// Replace buttons with loading button
	select('*', container)!.remove();
	container.append(githubLoadingButton);

	// Fetch older content
	const olderContent = await fetchDom(link!.href, '.repository-content')!;
	const olderList = select('.commits-listing', olderContent)!;

	const firstDate = select('div', olderList);
	if (firstDate?.textContent) {
		if (lastDate === firstDate?.textContent) {
			olderList.removeChild(firstDate);
		}
	}

	setLastDate(olderList);

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
	setLastDate();

	container = select('.paginate-container')!;
	link = select<HTMLAnchorElement>('div > a:last-child', container)!;

	if (link) {
		inView.observe(container);
	}
}

features.add({
	id: __featureName__,
	description: 'Infinite scroll on commit lists.',
	screenshot: false,
	include: [
		features.isCommitList
	],
	load: features.onDomReady,
	init
});
