import select from 'select-dom';
import debounce from 'debounce-fn';
import features from '../libs/features';

const DONE = 4;
const success = 200;

let listing: HTMLDivElement | null;
let container: HTMLDivElement | undefined;
let link: HTMLAnchorElement | undefined;

// Used feature: infinite-scroll as template

const loadMore = debounce(() => {
	if (!link!.href) {
		return; 
	}

	const githubLoadingButton = '<button class="btn mt-3" disabled><span>Loading</span><span class="AnimatedEllipsis"></span></button>';
	container!.innerHTML = githubLoadingButton;

	const xmlhttp = new XMLHttpRequest();

	xmlhttp.onreadystatechange = function () {
		if (xmlhttp.readyState === DONE) {
			if (xmlhttp.status === success) {
				const olderContent = this!.responseXML!;

				// Move over list
				let olderList = select('.commits-listing', olderContent)!;
				let node = olderList.firstChild;
				while (node) {
					listing!.append(node);
					node = olderList.firstChild;
				}

				// Set next buttons
				container!.innerHTML = select<HTMLDivElement>('.paginate-container', olderContent)!.innerHTML;
				link = select<HTMLAnchorElement>('div > a:last-child', container)!;
				inView.disconnect();
				inView.observe(link);
			} else {
				console.log(' Failed to load olderContent');
				console.log({readyState: xmlhttp.readyState, status: xmlhttp.status });
			}
		}
	}

	xmlhttp.open("GET", link!.href, true );
	xmlhttp.responseType = "document";
	xmlhttp.send();

}, {
	wait: 200
});

const inView = new IntersectionObserver(([{isIntersecting}]) => {
	if (isIntersecting) {
		loadMore();
	}
}, {
	rootMargin: '500px'
});

function init(): void {
	listing = select<HTMLDivElement>('.commits-listing')!;
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
