import select from 'select-dom';
import features from '../libs/features';

// Used feature: infinite-scroll as template

// Button from: https://primer.style/css/components/loaders
const githubLoadingButton = '<button class="btn mt-3" disabled><span>Loading</span><span class="AnimatedEllipsis"></span></button>';

let container: HTMLDivElement;
let link: HTMLAnchorElement | undefined;

function addContent(olderContent: HTMLDivElement): void {
	// List that we add
	const olderList = select('.commits-listing', olderContent)!;

	olderList.classList.add('border-top', 'border-gray-dark');
	container.parentNode!.insertBefore(olderList, container);

	// Setting container directly breaks it
	container.innerHTML = select<HTMLDivElement>('.paginate-container', olderContent)!.innerHTML;

	link = select<HTMLAnchorElement>('div > a:last-child', container)!;
	inView.observe(link);
}

async function loadOlder() {
	// Don't load if we don't have the link
	if (!link!.href) {
		return;
	}

	inView.disconnect();

	// Replace buttons with loading button
	container.innerHTML = githubLoadingButton;

	const options = { 
		method: 'GET',
		headers: {
			'Content-Type': 'text/html'
		}
	}

	const response = await fetch(link!.href, options);
	const html = await response.text();
	
	let parser = new DOMParser();
	const oldDocument = parser.parseFromString(html, 'text/html');
	const olderContent = select<HTMLDivElement>('.repository-content', oldDocument);

	addContent(olderContent!);
};

const inView = new IntersectionObserver(([{isIntersecting}]) => {
	if (isIntersecting) {
		loadOlder();
	}
}, {
	rootMargin: '500px'
});

function init(): void {
	container = select<HTMLDivElement>('.paginate-container')!;
	link = select<HTMLAnchorElement>('div > a:last-child', container)!;

	if (link) {
		inView.observe(link);
	}
}

features.add({
	id: __featureName__,
	description: 'test features',
	screenshot: false,
	include: [
		features.isCommitList
	],
	load: features.onDomReady,
	init
});
