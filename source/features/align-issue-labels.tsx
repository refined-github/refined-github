import './align-issue-labels.css';
import features from '../libs/features';

function init(): void {
	document.body.classList.add('rgh-align-issue-labels');
}

features.add({
	id: __featureName__,
	description: 'Aligns labels in lists to the left.',
	screenshot: false,
	init
});
