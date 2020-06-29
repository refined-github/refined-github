import './hug-circles.css';
import features from '.';

function init(): void {
	document.body.classList.add('rgh-hug-circles');
}

void features.add({
	id: __filebasename,
	description: 'Removes the new-UI circles and turns them into squares(old UI).',
	screenshot: false
}, {
	waitForDomReady: false,
	repeatOnAjax: false,
	init
});
