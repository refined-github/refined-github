import select from 'select-dom';
import debounce from 'debounce-fn';
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
	container.parentNode!.insertBefore( olderList,  container );

	// setting container directly breaks it
	container.innerHTML = select<HTMLDivElement>('.paginate-container', olderContent)!.innerHTML;

	link = select<HTMLAnchorElement>('div > a:last-child', container)!;
	inView.disconnect();
	inView.observe(link);
}

const loadMore = debounce(() => {
	if (!link!.href) {
		return;
	}

	// Set Older and New buttons to laoding
	// While we load the next page
	container.innerHTML = githubLoadingButton;

	fetch(link!.href, {
		method: 'GET',
		headers: { 'Content-Type': 'text/html' }
	}).then((response) => {
		return response.text();
	}).then((html) => {
		let oldDoc  = new DOMParser().parseFromString(html, "text/html");
		let olderContent = select<HTMLDivElement>('.repository-content', oldDoc)
		addContent(olderContent!);
	});

}, {wait: 200});

const inView = new IntersectionObserver(([{isIntersecting}]) => {
	if (isIntersecting) {
		loadMore();
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
