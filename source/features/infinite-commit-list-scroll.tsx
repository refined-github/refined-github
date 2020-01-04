import select from 'select-dom';
import React from 'dom-chef';
import fetchDom from '../libs/fetch-dom';
import features from '../libs/features';

// Button from: https://primer.style/css/components/loaders
const githubLoadingButton = <button className="btn mn-3" disabled><span>Loading</span><span className="AnimatedEllipsis"></span></button>;

let container: HTMLElement;
let link: HTMLAnchorElement | undefined;

async function appendOlder(): Promise<void> {
	// Replace buttons with loading button
	select('*', container)!.remove();
	container.append(githubLoadingButton);

	// Fetch older content
	const olderContent = await fetchDom(link!.href, '.repository-content')!;
	const olderList = select('.commits-listing', olderContent)!;

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
	container = select('.paginate-container')!;
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
