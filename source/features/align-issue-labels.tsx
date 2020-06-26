import './align-issue-labels.css';
import features from '.';

function init(): void {
	document.body.classList.add('rgh-align-issue-labels');
}

void features.add({
	id: __filebasename,
	description: 'Aligns labels in lists to the left.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/28006237-070b8214-6581-11e7-94bc-2b01a007d00b.png'
}, {
	waitForDomReady: false,
	repeatOnAjax: false,
	init
});
