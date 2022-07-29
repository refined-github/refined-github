const gitHub = new EventTarget();

export default gitHub;

let isPopstate = false;
window.addEventListener('popstate', () => {
	console.log('NEW: popstate');
	isPopstate = true;
});
document.addEventListener('turbo:visit', () => {
	console.log('NEW: turbo:visit');
	gitHub.dispatchEvent(new CustomEvent(isPopstate ? 'popstate' : 'load'));

	// Reset for future events
	isPopstate = false;
});
