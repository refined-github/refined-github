const className = 'rgh-no-navigation-highlight';

export default function () {
	document.body.classList.add(className);
	document.body.addEventListener('navigation:keydown', () => {
		document.body.classList.remove(className);
	}, {once: true});
}

