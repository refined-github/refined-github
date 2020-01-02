import select from 'select-dom';
import features from '../libs/features';
// import debounce from 'debounce-fn';
// import observeEl from '../libs/simplified-element-observer';
const DONE = 4;
const success = 200;

let listing:   HTMLDivElement    | null;
let container: HTMLDivElement    | undefined;
let link:      HTMLAnchorElement | undefined;


const loadMore = (): void => {  //debounce(() => {

	if( !link!.href ) return; 

	container!.innerHTML = '<footer> <span class="Label bg-blue mt-3"><span>Loading</span><span class="AnimatedEllipsis"></span></span><br> </footer>'

	let xmlhttp = new XMLHttpRequest()

	let olderContent: Document | null;
	xmlhttp.onreadystatechange = function() {
		if( xmlhttp.readyState == DONE ) {
			if( xmlhttp.status == success ) {
				olderContent = this!.responseXML!;

				// Move over list
				let olderList = select('.commits-listing', olderContent)!;
				let node = olderList.firstChild;
				while( node ) {
					listing!.appendChild( node );
					node = olderList.firstChild;
				}

				// Set next buttons
				container!.innerHTML = select<HTMLDivElement>('.paginate-container', olderContent)!.innerHTML;
				link = select<HTMLAnchorElement>('div > a:last-child', container)!;
				inView.disconnect();
				inView.observe(link);
				// let content = olderList.parentNode!;
				// content.removeChild(container!);
				// let newContainer = select<HTMLDivElement>('.paginate-container', olderContent)!;
				// content.appendChild( newContainer );
			} else {
				console.log(" Failed to load olderContent");
				console.log({readyState: xmlhttp.readyState, status: xmlhttp.status });
			}
		}
	}

	xmlhttp.open("GET", link!.href, true );
	xmlhttp.responseType = "document"
	xmlhttp.send();


}//, {wait: 200});

const inView = new IntersectionObserver(([{isIntersecting}]) => {
	if (isIntersecting) { 
		console.log("loading more");
		loadMore();
	}
}, {
	rootMargin: '500px'
});

// const findLink = (): void => {
// 	// Watch the new link, or stop everything
// };

function init(): void {
	listing = select<HTMLDivElement>('.commits-listing')!;
	container = select<HTMLDivElement>('.paginate-container')!;
	link = select<HTMLAnchorElement>('div > a:last-child', container)!;

	// findLink();
	if (link) {
		debugger;
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
