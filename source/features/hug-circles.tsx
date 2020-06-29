import './hug-circles.css';
import features from '.';

function init(): void {
	document.body.classList.add('rgh-hug-circles');
}

void features.add({
	id: __filebasename,
	description: 'Removes the new-UI circles and turns them into squares(old UI).',
	screenshot: 'https://user-images.githubusercontent.com/11302521/86065591-42eaa980-ba70-11ea-8171-6d919a237d6e.png'
}, {
	waitForDomReady: false,
	repeatOnAjax: false,
	init
});
