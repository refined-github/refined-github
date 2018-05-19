/*
Some lists like notifications, file lists, and issue lists,
are highlighted as you move the mouse over them. This highlight
is useful when navigating via the keyboard (j/k), but annoying
when just moving the mouse around.

This feature will hide the highlight until the first keyboard
navigation, then it will be displayed until the next full reload.
*/
const className = 'rgh-no-navigation-highlight';

export default function () {
	document.body.classList.add(className);
	document.body.addEventListener('navigation:keydown', () => {
		document.body.classList.remove(className);
	}, {once: true});
}
