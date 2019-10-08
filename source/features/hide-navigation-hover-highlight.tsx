import './hide-navigation-hover-highlight.css';
import features from '../libs/features';

const className = 'rgh-no-navigation-highlight';

function init(): void {
	document.body.classList.add(className);
	document.body.addEventListener('navigation:keydown', () => {
		document.body.classList.remove(className);
	}, {once: true});
}

features.add({
	id: __featureName__,
	description: 'Removes the file hover effect in the repo file browser. Some lists like notifications, file lists, and issue lists, are highlighted as you move the mouse over them. This highlight is useful when navigating via the keyboard (j/k), but annoying when just moving the mouse around.',
	screenshot: false,
	init
});
