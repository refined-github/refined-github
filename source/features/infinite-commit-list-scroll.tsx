import './infinite-commit-list-scroll.css';
import select from 'select-dom';
import React from 'dom-chef';
import fetchDom from '../libs/fetch-dom';
import features from '../libs/features';

// Button from: https://primer.style/css/components/loaders
const githubLoadingButton = (
	<button className="btn mn-3" disabled>
		<span>Loading</span><span className="AnimatedEllipsis"/>
	</button>
);

let pagination: HTMLElement;
let link: HTMLAnchorElement | undefined;

async function appendOlder(): Promise<void> {
	// Replace buttons with loading button
	pagination.firstElementChild!.replaceWith(githubLoadingButton);

	// Fetch older content
	const olderContent = await fetchDom(link!.href, '.repository-content')!;

	// Drop duplicate date header before merging the lines
	const oldestDateHeaderOnPage = select.last('.commit-group-title')!;
	const newestDateHeaderInLoadedContent = select('.commit-group-title', olderContent)!;
	if (oldestDateHeaderOnPage.textContent === newestDateHeaderInLoadedContent.textContent) {
		newestDateHeaderInLoadedContent.remove();
	}

	// Append older commits
	select('.commits-listing')!.append(...select.all('.commits-listing > *', olderContent));

	// Set loading button to Newer and Older links
	pagination.firstElementChild!.replaceWith(select('.paginate-container > .BtnGroup', olderContent)!);
	link = select<HTMLAnchorElement>('div > a:last-child', pagination)!;

	if (!link) {
		inView.disconnect()
	}
}

const inView = new IntersectionObserver(([{isIntersecting}]) => {
	if (isIntersecting) {
		appendOlder();
	}
}, {
	rootMargin: '500px'
});

function init(): void {
	pagination = select('.paginate-container')!;
	link = select<HTMLAnchorElement>('div > a:last-child', pagination)!;

	if (link) {
		inView.observe(pagination);
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
